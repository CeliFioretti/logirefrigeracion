const db = require('../config/db.js');

// AUDITORÍA
// Obtener registro completo de auditoría
const listar = async (req, res, next) => {
    const { nombreUsuario , fecha, accion} = req.query;

    try {
        let query = 'SELECT * FROM auditoriadeactividades';
        let condiciones = [];   
        let params = [];

        if (nombreUsuario) {
            condiciones.push('usuario_nombre LIKE ?');
            params.push(`%${nombreUsuario}%`);
        }
        if (fecha) {
            condiciones.push('DATE(fecha_hora) = ?');
            params.push(fecha);
        }
        if (accion) {
            condiciones.push('accion LIKE ?');
            params.push(`%${accion}%`);
        }


        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
        }

        const [resultado] = await db.promise().query(query, params);

        if(resultado.length === 0) {
            res.status(200).json({
                message: 'No hay registros de auditoría actualmente',
                data: []
            })
        } else {
            res.status(200).json({
                data: resultado
            })
        }

    } catch (error) {
        next(error)
    }

}

module.exports = { listar }