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
                [entregasResult],
                [retirosResult],
                [ultimosFreezers]
            ] = await Promise.all([
                db.promise().query('SELECT COUNT(*) AS totalClientes FROM cliente'),
                db.promise().query('SELECT COUNT(*) AS mantenimientosPendientes FROM asignacionmantenimiento'),
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
        `)
            ]);

            return res.status(200).json({
                totalClientes: clientesResult[0].totalClientes,
                mantenimientosPendientes: mantenimientosResult[0].mantenimientosPendientes,
                freezersDisponibles: disponiblesResult[0].freezersDisponibles,
                freezersPrestados: prestadosResult[0].freezersPrestados,
                entregasDelMes: entregasResult[0].entregasDelMes,
                retirosDelMes: retirosResult[0].retirosDelMes,
                ultimosFreezers
            });
        }

        else if (usuario.rol === 'operador') {
            const [
                [asignacionesResult],
                [notificacionesResult]
            ] = await Promise.all([
                db.promise().query('SELECT COUNT(*) AS misAsignaciones FROM asignacionmantenimiento WHERE usuario_id = ?', [usuario.id]),
                db.promise().query('SELECT COUNT(*) AS notificaciones FROM notificacion WHERE usuario_id = ? AND leida = 0', [usuario.id])
            ]);

            return res.status(200).json({
                misAsignaciones: asignacionesResult[0].misAsignaciones,
                notificaciones: notificacionesResult[0].notificaciones
            });
        }

    } catch (err) {
        next(err);
    }
};


module.exports = { mostrar };

