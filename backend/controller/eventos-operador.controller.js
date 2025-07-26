const db = require('../config/db.js');

// Lista los eventos (entregas/retiros) realizados por el operador logueado
const listarMisEventos = async (req, res, next) => {
    const idUsuarioOperador = req.usuario.id; // Obtenemos el ID del operador desde el token
    const { page, pageSize, search } = req.query; // Para paginación y búsqueda

    try {
        let query = `
            SELECT 
                ef.id AS evento_id,
                ef.fecha,
                ef.tipo,
                ef.observaciones,
                ef.usuario_id,
                ef.usuario_nombre,
                ef.freezer_id,
                f.numero_serie AS freezer_numero_serie,
                f.modelo AS freezer_modelo,
                f.tipo AS freezer_tipo,
                ef.cliente_id,
                ef.cliente_nombre
            FROM eventofreezer ef
            JOIN freezer f ON ef.freezer_id = f.id
            WHERE ef.usuario_id = $1
        `;
        let countQuery = `
            SELECT COUNT(ef.id) as total 
            FROM eventofreezer ef
            JOIN freezer f ON ef.freezer_id = f.id
            WHERE ef.usuario_id = $1
        `;

        let params = [idUsuarioOperador];
        let countParams = [idUsuarioOperador];
        let paramIndex = 2; // Empezamos con $2 para los parámetros de búsqueda

        if (search) {
            const searchQueryParam = `
                AND (f.numero_serie ILIKE $${paramIndex++} OR f.modelo ILIKE $${paramIndex++} OR ef.tipo ILIKE $${paramIndex++} OR ef.cliente_nombre ILIKE $${paramIndex++} OR ef.observaciones ILIKE $${paramIndex++})
            `;
            const searchPattern = `%${search}%`;
            query += searchQueryParam;
            countQuery += searchQueryParam;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        query += ` ORDER BY ef.fecha DESC`; // Ordenar por fecha, los más recientes primero

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);

        const { rows: eventos } = await db.query(query, params);
        const { rows: totalResult } = await db.query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        if (eventos.length === 0) {
            return res.status(200).json({
                message: 'No se encontraron eventos para este operador.',
                data: [],
                total: 0
            });
        }

        res.status(200).json({
            data: eventos,
            total: totalRegistros
        });

    } catch (error) {
        console.error('Error al listar eventos del operador:', error);
        next(error);
    }
};

// Función para registrar un nuevo evento (entrega/retiro) por el operador
const registrarEventoOperador = async (req, res, next) => {
    const { freezer_id, cliente_id, fecha, tipo, observaciones } = req.body;
    const idUsuarioOperador = req.usuario.id;
    const nombreUsuarioOperador = req.usuario.nombre;

    // Validación básica de datos
    if (!freezer_id || !cliente_id || !fecha || !tipo) {
        return res.status(400).json({ message: 'Faltan datos obligatorios: freezer, cliente, fecha y tipo de evento.' });
    }

    try {
        // Obtener nombre del cliente para registrarlo en eventofreezer
        const { rows: clienteRows } = await db.query('SELECT nombre_responsable FROM cliente WHERE id = $1', [cliente_id]);
        if (clienteRows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        const cliente_nombre = clienteRows[0].nombre_responsable;

        // Insertar el evento en la tabla eventofreezer
        // Usar RETURNING id para obtener el ID del registro insertado en PostgreSQL
        const { rows: result } = await db.query(
            `INSERT INTO eventofreezer 
             (usuario_id, freezer_id, usuario_nombre, cliente_id, cliente_nombre, fecha, tipo, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                idUsuarioOperador,
                freezer_id,
                nombreUsuarioOperador,
                cliente_id,
                cliente_nombre,
                fecha, // La fecha ya viene en formato de DB desde el frontend
                tipo.toLowerCase(), // Asegurar que se guarda en minúsculas
                observaciones || null
            ]
        );

        const eventoId = result[0].id; // Acceder al ID insertado

        // Actualizar el estado del freezer
        let nuevoEstadoFreezer;
        if (tipo.toLowerCase() === 'entrega') {
            nuevoEstadoFreezer = 'Asignado';
        } else if (tipo.toLowerCase() === 'retiro') {
            nuevoEstadoFreezer = 'Disponible';
        } else {
            return res.status(400).json({ message: 'Tipo de evento inválido. Debe ser "Entrega" o "Retiro".' });
        }

        await db.query(
            `UPDATE freezer SET estado = $1, cliente_id = $2 WHERE id = $3`,
            [nuevoEstadoFreezer, (nuevoEstadoFreezer === 'Asignado' ? cliente_id : null), freezer_id]
        );

        // Auditoría
        await db.query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
             VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioOperador, nombreUsuarioOperador, `Operador ${nombreUsuarioOperador} registró evento de ${tipo} (ID: ${eventoId}) para freezer ${freezer_id} y cliente ${cliente_id}.`]
        );

        res.status(201).json({ message: 'Evento registrado con éxito.', eventoId: eventoId });

    } catch (error) {
        console.error('Error al registrar evento del operador:', error);
        next(error);
    }
};


module.exports = {
    listarMisEventos,
    registrarEventoOperador
};
