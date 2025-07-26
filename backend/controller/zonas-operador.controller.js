const db = require('../config/db');

// Ver mis zonas asignadas (Operador) - GET
const verMisZonasAsignadas = async (req, res, next) => {
    const idUsuarioOperador = req.usuario.id;

    try {
        const { rows: zonas } = await db.query( 
            `SELECT 
                z.id AS zona_id,
                z.nombre AS nombre_zona,
                d.nombre AS nombre_departamento
            FROM zona z
            JOIN departamento d ON z.departamento_id = d.id
            WHERE z.usuario_id = $1
            ORDER BY d.nombre, z.nombre ASC`,
            [idUsuarioOperador]
        );

        if (zonas.length === 0) {
            return res.status(200).json({
                message: 'No tienes zonas asignadas.',
                data: []
            });
        }

        res.status(200).json({
            data: zonas
        });

    } catch (error) {
        console.error('Error al listar zonas asignadas del operador:', error);
        next(error);
    }
};

module.exports = {
    verMisZonasAsignadas
};
