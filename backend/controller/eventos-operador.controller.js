const db = require('../config/db.js');

// Lista los eventos (entregas/retiros) realizados por el operador - GET
const listarMisEventos = async (req, res, next) => {
    const idUsuarioOperador = req.usuario.id; 
    const { page, pageSize, search } = req.query; 

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
            WHERE ef.usuario_id = ?
        `;
        let countQuery = `
            SELECT COUNT(ef.id) as total 
            FROM eventofreezer ef
            JOIN freezer f ON ef.freezer_id = f.id
            WHERE ef.usuario_id = ?
        `;

        let params = [idUsuarioOperador];
        let countParams = [idUsuarioOperador];

        if (search) {
            const searchQueryParam = `
                AND (f.numero_serie LIKE ? OR f.modelo LIKE ? OR ef.tipo LIKE ? OR ef.cliente_nombre LIKE ? OR ef.observaciones LIKE ?)
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

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSizeNum, offset);

        const [eventos] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
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

// Función para registrar un nuevo evento (entrega/retiro) por el operador - POST
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
        const [clienteRows] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [cliente_id]);
        if (clienteRows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        const cliente_nombre = clienteRows[0].nombre_responsable;

        // Insertar el evento en la tabla eventofreezer
        const [result] = await db.promise().query(
            `INSERT INTO eventofreezer 
             (usuario_id, freezer_id, usuario_nombre, cliente_id, cliente_nombre, fecha, tipo, observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idUsuarioOperador,
                freezer_id,
                nombreUsuarioOperador,
                cliente_id,
                cliente_nombre,
                fecha, 
                tipo.toLowerCase(), // Asegurar que se guarda en minúsculas
                observaciones || null
            ]
        );

        const eventoId = result.insertId;

        // Actualizar el estado del freezer
        let nuevoEstadoFreezer;
        if (tipo.toLowerCase() === 'entrega') {
            nuevoEstadoFreezer = 'Asignado';
        } else if (tipo.toLowerCase() === 'retiro') {
            nuevoEstadoFreezer = 'Disponible';
        } else {
            return res.status(400).json({ message: 'Tipo de evento inválido. Debe ser "Entrega" o "Retiro".' });
        }

        await db.promise().query(
            `UPDATE freezer SET estado = ?, cliente_id = ? WHERE id = ?`,
            [nuevoEstadoFreezer, (nuevoEstadoFreezer === 'Asignado' ? cliente_id : null), freezer_id]
        );

        // Auditoría
        await db.promise().query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
             VALUES (?, ?, NOW(), ?)`,
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
