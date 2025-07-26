const db = require('../config/db');

const mostrar = async (req, res, next) => {
    const usuario = req.usuario;

    try {
        if (usuario.rol === 'administrador') {
            const [
                clientesResult,
                mantenimientosResult,
                disponiblesResult,
                prestadosResult,
                entregasMesResult,
                retirosMesResult,
                ultimosFreezersResult,
                entregasDiariasResult,
                retirosDiariosResult
            ] = await Promise.all([
                db.query('SELECT COUNT(*) AS totalClientes FROM cliente'),
                db.query('SELECT COUNT(*) AS mantenimientosPendientes FROM asignacionmantenimiento'),
                db.query('SELECT COUNT(*) AS freezersDisponibles FROM freezer WHERE estado = \'Disponible\''),
                db.query('SELECT COUNT(*) AS freezersPrestados FROM freezer WHERE estado = \'Asignado\''),
                db.query(`
                    SELECT COUNT(*) AS entregasDelMes
                    FROM eventofreezer
                    WHERE tipo = 'entrega'
                    AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                `),
                db.query(`
                    SELECT COUNT(*) AS retirosDelMes
                    FROM eventofreezer
                    WHERE tipo = 'retiro'
                    AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                `),
                db.query(`
                    SELECT id, numero_serie, modelo, capacidad, marca, estado, imagen, fecha_creacion
                    FROM freezer
                    ORDER BY fecha_creacion DESC
                    LIMIT 5
                `),
                db.query(`
                    SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS dia, COUNT(*) AS total
                    FROM eventofreezer
                    WHERE tipo = 'entrega' AND fecha >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY dia
                    ORDER BY dia ASC
                `),
                db.query(`
                    SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS dia, COUNT(*) AS total
                    FROM eventofreezer
                    WHERE tipo = 'retiro' AND fecha >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY dia
                    ORDER BY dia ASC
                `)
            ]);

            // Formateo de resultados diarios para el gráfico
            const formatearDatosDiarios = (data) => {
                const ultimos30Dias = [];
                for (let i = 0; i < 30; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i)); // empieza 29 días atrás, hasta hoy
                    const diaFormato = d.toISOString().slice(0, 10);
                    ultimos30Dias.push({
                        dia: diaFormato,
                        total: 0
                    });
                }

                data.forEach(item => {
                    const diaEncontrado = ultimos30Dias.find(d => d.dia === item.dia);
                    if (diaEncontrado) {
                        diaEncontrado.total = item.total;
                    }
                });
                return ultimos30Dias;
            };

            const entregasDiarias = formatearDatosDiarios(entregasDiariasResult.rows);
            const retirosDiarios = formatearDatosDiarios(retirosDiariosResult.rows);

            return res.status(200).json({
                totalClientes: clientesResult.rows[0].totalclientes, 
                mantenimientosPendientes: mantenimientosResult.rows[0].mantenimientospendientes,
                freezersDisponibles: disponiblesResult.rows[0].freezersdisponibles,
                freezersPrestados: prestadosResult.rows[0].freezersprestados,
                entregasDelMes: entregasMesResult.rows[0].entregasdelmes,
                retirosDelMes: retirosMesResult.rows[0].retirosdelmes,
                ultimosFreezers: ultimosFreezersResult.rows,
                entregasDiarias,
                retirosDiarios
            });

        } else if (usuario.rol === 'operador') {
            const [
                asignacionesResult,
                notificacionesResult
            ] = await Promise.all([
                db.query('SELECT COUNT(*) AS misAsignaciones FROM asignacionmantenimiento WHERE usuario_id = $1', [usuario.id]),
                db.query('SELECT COUNT(*) AS notificaciones FROM notificacion WHERE usuario_id = $1 AND leida = 0', [usuario.id])
            ]);

            return res.status(200).json({
                misAsignaciones: asignacionesResult.rows[0].misasignaciones,
                notificaciones: notificacionesResult.rows[0].notificaciones
            });
        }

    } catch (err) {
        console.error('Error en el dashboard controller:', err);
        next(err);
    }
};

module.exports = { mostrar };