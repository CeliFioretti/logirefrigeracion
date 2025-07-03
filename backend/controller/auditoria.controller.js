const db = require('../config/db.js');

const listar = async (req, res, next) => {
    const { usuarioId, usuarioNombre, accion, fechaDesde, fechaHasta, page = 0, pageSize = 10 } = req.query;

    try {
        let query = 'SELECT * FROM auditoriadeactividades';
        let countQuery = 'SELECT COUNT(*) as total FROM auditoriadeactividades'; // obtenemos el total de registros

        let condiciones = [];
        let params = []; // parametros para la query de datos
        let countParams = []; // parametros para la query de conteo (normalmente los mismos que los filtros)

        // Filtro por ID de Usuario
        if (usuarioId) {
            condiciones.push('usuario_id = ?');
            params.push(usuarioId);
            countParams.push(usuarioId);
        }

        // Filtro por Nombre de Usuario (LIKE para búsqueda parcial)
        if (usuarioNombre) {
            condiciones.push('usuario_nombre LIKE ?');
            params.push(`%${usuarioNombre}%`);
            countParams.push(`%${usuarioNombre}%`);
        }

        // Filtro por Contenido de la Acción (LIKE para búsqueda parcial en el mensaje)
        if (accion) {
            condiciones.push('accion LIKE ?');
            params.push(`%${accion}%`);
            countParams.push(`%${accion}%`);
        }

        // Filtro por Fecha Desde
        if (fechaDesde) {
            // Aseguramos que la fecha incluya el inicio del día
            condiciones.push('fecha_hora >= ?');
            params.push(`${fechaDesde} 00:00:00`);
            countParams.push(`${fechaDesde} 00:00:00`);
        }

        // Filtro por Fecha Hasta
        if (fechaHasta) {
            // Aseguramos que la fecha incluya hasta el final del día
            condiciones.push('fecha_hora <= ?');
            params.push(`${fechaHasta} 23:59:59`);
            countParams.push(`${fechaHasta} 23:59:59`);
        }

        // Construimos la cláusula WHERE si hay condiciones
        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
            countQuery += ' WHERE ' + condiciones.join(' AND '); // aplica las condiciones al query de conteo
        }
        // Opcional: Ordenar los resultados
        query += ' ORDER BY fecha_hora DESC';

        // Calculo del OFFSET y el LIMIT para la paginación
        const limit = parseInt(pageSize);
        const offset = parseInt(page) * limit;

        query += ' LIMIT ?, ?';
        params.push(offset, limit);

        // Ejecutar ambas consultas de forma paralela
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        // Obtenemos los registros de la pagina actual
        const [resultado] = await db.promise().query(query, params);

        if (resultado.length === 0 && totalRegistros === 0) {
            res.status(200).json({
                message: 'No hay registros de auditoría que coincidan con los filtros.',
                data: [],
                total: 0
            });
        } else {
            res.status(200).json({
                data: resultado,
                total: totalRegistros
            });
        }

    } catch (error) {
        console.error('Error en el controlador de auditoría:', error);
        next(error); // Pasa el error al siguiente middleware de manejo de errores
    }
};

module.exports = {
    listar
};