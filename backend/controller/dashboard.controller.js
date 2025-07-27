const db = require('../config/db');

const mostrar = async (req, res, next) => {
    const usuario = req.usuario;

    try {
        if (usuario.rol === 'administrador') {
            const [
                [clientesResult],
                [mantenimientosResult], 
                [disponiblesResult],
                [prestadosResult],
                [entregasMesResult],
                [retirosMesResult],
                [ultimosFreezersRows],
                [entregasDiariasRows],
                [retirosDiariosRows]
            ] = await Promise.all([
                db.promise().query('SELECT COUNT(*) AS totalClientes FROM cliente'),
                
                db.promise().query('SELECT COUNT(*) AS mantenimientosPendientes FROM asignacionmantenimiento WHERE estado = "pendiente"'),
                db.promise().query('SELECT COUNT(*) AS freezersDisponibles FROM freezer WHERE estado = "Disponible"'),
                db.promise().query('SELECT COUNT(*) AS freezersPrestados FROM freezer WHERE estado = "Asignado"'),
                db.promise().query(`
                    SELECT COUNT(*) AS entregasDelMes
                    FROM eventofreezer
                    WHERE tipo = 'entrega'
                    AND MONTH(fecha) = MONTH(CURRENT_DATE())
                    AND YEAR(fecha) = YEAR(CURRENT_DATE())
                `),
                db.promise().query(`
                    SELECT COUNT(*) AS retirosDelMes
                    FROM eventofreezer
                    WHERE tipo = 'retiro'
                    AND MONTH(fecha) = MONTH(CURRENT_DATE())
                    AND YEAR(fecha) = YEAR(CURRENT_DATE())
                `),
                db.promise().query(`
                    SELECT id, numero_serie, modelo, capacidad, marca, estado, imagen, fecha_creacion
                    FROM freezer
                    ORDER BY fecha_creacion DESC
                    LIMIT 5
                `),
                db.promise().query(`
                    SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS dia, COUNT(*) AS total
                    FROM eventofreezer
                    WHERE tipo = 'entrega' AND fecha >= CURDATE() - INTERVAL 30 DAY
                    GROUP BY dia
                    ORDER BY dia ASC
                `),
                db.promise().query(`
                    SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS dia, COUNT(*) AS total
                    FROM eventofreezer
                    WHERE tipo = 'retiro' AND fecha >= CURDATE() - INTERVAL 30 DAY
                    GROUP BY dia
                    ORDER BY dia ASC
                `)
            ]);

            // Formateo de resultados diarios para el gráfico
            const formatearDatosDiarios = (data) => {
                const ultimos30Dias = [];
                for (let i = 0; i < 30; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i)) // empieza 29 días atrás, hasta hoy
                    const diaFormato = d.toISOString().slice(0, 10);
                    ultimos30Dias.push({
                        dia: diaFormato,
                        total: 0
                    })
                }

                data.forEach(item => {
                    const diaEncontrado = ultimos30Dias.find(d => d.dia === item.dia);
                    if (diaEncontrado) {
                        diaEncontrado.total = item.total;
                    }
                });
                return ultimos30Dias;

            }

            const entregasDiarias = formatearDatosDiarios(entregasDiariasRows);
            const retirosDiarios = formatearDatosDiarios(retirosDiariosRows);

            return res.status(200).json({
                totalClientes: clientesResult[0].totalClientes,
                mantenimientosPendientes: mantenimientosResult[0].mantenimientosPendientes,
                freezersDisponibles: disponiblesResult[0].freezersDisponibles,
                freezersPrestados: prestadosResult[0].freezersPrestados,
                entregasDelMes: entregasMesResult[0].entregasDelMes,
                retirosDelMes: retirosMesResult[0].retirosDelMes,
                ultimosFreezers: ultimosFreezersRows,
                entregasDiarias,
                retirosDiarios
            });

        } else if (usuario.rol === 'operador') {
            const [
                [asignacionesResult],
                [notificacionesResult]
            ] = await Promise.all([
                db.promise().query('SELECT COUNT(*) AS misAsignaciones FROM asignacionmantenimiento WHERE usuario_id = ? AND estado = "pendiente"', [usuario.id]),
                db.promise().query('SELECT COUNT(*) AS notificaciones FROM notificacion WHERE usuario_id = ? AND leida = 0', [usuario.id])
            ]);

            return res.status(200).json({
                misAsignaciones: asignacionesResult[0].misAsignaciones,
                notificaciones: notificacionesResult[0].notificaciones
            });
        }

    } catch (err) {
        console.error('Error en el dashboard controller:', err)
        next(err);
    }
};

module.exports = { mostrar };
