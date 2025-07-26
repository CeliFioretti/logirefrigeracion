const db = require('../config/db.js')

// Obtener registro completo de clientes
const listar = async (req, res, next) => {
    const { nombreCliente, tipoNegocio, nombreNegocio, cuit, page, pageSize } = req.query;

    try {
        let query = 'SELECT * FROM cliente';
        let countQuery = 'SELECT COUNT(*) as total FROM cliente';

        let condiciones = [];
        let params = [];
        let countParams = [];
        let paramIndex = 1;

        if (nombreCliente) {
            condiciones.push(`nombre_responsable ILIKE $${paramIndex++}`);
            params.push(`%${nombreCliente}%`);
            countParams.push(`%${nombreCliente}%`);
        }
        if (tipoNegocio) {
            condiciones.push(`tipo_negocio ILIKE $${paramIndex++}`);
            params.push(`%${tipoNegocio}%`);
            countParams.push(`%${tipoNegocio}%`);
        }
        if (nombreNegocio) {
            condiciones.push(`nombre_negocio ILIKE $${paramIndex++}`);
            params.push(`%${nombreNegocio}%`);
            countParams.push(`%${nombreNegocio}%`);
        }
        if (cuit) {
            // PostgreSQL usa REPLACE de forma similar
            condiciones.push(`REPLACE(cuit, '-', '') ILIKE $${paramIndex++}`);
            params.push(`%${cuit}%`);
            countParams.push(`%${cuit}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        // Los parámetros de paginación deben ir al final de los parámetros de filtro
        const totalCountParams = [...countParams]; // Clonar para la consulta de conteo
        const queryParams = [...params]; // Clonar para la consulta principal

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        queryParams.push(pageSizeNum, offset);

        const { rows: totalResult } = await db.query(countQuery, totalCountParams);
        const totalRegistros = totalResult[0].total;

        const { rows: clientes } = await db.query(query, queryParams);

        if (clientes.length === 0 && totalRegistros === 0) {
            res.status(200).json({
                message: 'No hay registros de clientes actualmente',
                data: [],
                total: 0
            });
        } else {
            res.status(200).json({
                data: clientes,
                total: totalRegistros,
                message: clientes.length === 0 ? 'No se encontraron freezers con los criterios especificados.' : undefined
            });
        }

    } catch (error) {
        console.error('Error al listar clientes:', error);
        next(error);
    }
};

// Obtiene los detalles de un cliente
const detalle = async (req, res, next) => {
    const idCliente = req.params.id;

    try {
        // TO_CHAR para formatear la fecha en PostgreSQL
        let clienteQuery = `
            SELECT id, cuit, nombre_negocio, nombre_responsable, 
                   TO_CHAR(fecha_registro, 'DD-MM-YYYY') as fecha_registro, 
                   telefono, correo, direccion, tipo_negocio, imagen 
            FROM cliente 
            WHERE id = $1`;
        const { rows: clienteResults } = await db.query(clienteQuery, [idCliente]);

        if (clienteResults.length === 0) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        const cliente = clienteResults[0];

        let freezerQuery = 'SELECT id, numero_serie, modelo, marca, tipo, capacidad, estado, imagen FROM freezer WHERE cliente_id = $1';
        const { rows: freezersResults } = await db.query(freezerQuery, [idCliente]);

        res.status(200).json({
            data: {
                cliente: cliente,
                freezersAsignados: freezersResults,
                totalFreezers: freezersResults.length
            }
        });

    } catch (err) {
        console.error('Error al obtener detalles del cliente:', err);
        next(err);
    }
};

// Crea un cliente - POST
const crear = async (req, res, next) => {

    const { cuit, nombre_negocio, nombre_responsable, telefono, correo, direccion, tipo_negocio } = req.body;

    const campos = {
        cuit,
        nombre_negocio,
        nombre_responsable,
        telefono,
        correo,
        direccion,
        tipo_negocio
    };

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        for (const [clave, valor] of Object.entries(campos)) {
            if (!valor || String(valor).trim() === "") { // Convertir a String para trim
                return res.status(400).json({
                    error: `El campo "${clave}" es obligatorio`
                });
            }
        }

        // Usar $n para los placeholders
        const query = `INSERT INTO cliente (cuit, nombre_negocio, nombre_responsable, fecha_registro, telefono, correo, direccion, tipo_negocio) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7)`;

        const valores = Object.values(campos);

        await db.query(query, valores);

        // Auditoría
        const mensaje = `Registro de nuevo cliente: ${nombre_responsable.replace(/'/g, "")}`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Cliente creado con éxito'
        });
    } catch (err) {
        console.error('Error al crear cliente:', err);
        next(err);
    }
};

// Editar cliente - PUT
const editar = async (req, res, next) => {
    const id = req.params.id;

    const campos = [
        "cuit",
        "nombre_negocio",
        "nombre_responsable",
        "telefono",
        "correo",
        "direccion",
        "tipo_negocio"
    ];

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let setClause = [];
        let params = [];
        let paramIndex = 1; // Reiniciar el índice de parámetros para esta consulta

        campos.forEach(campo => {
            if (req.body[campo] !== undefined && String(req.body[campo]).trim() !== "") { // Convertir a String para trim
                setClause.push(`${campo} = $${paramIndex++}`);
                params.push(req.body[campo]);
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No se proporcionó ningún campo para actualizar' });
        }

        const query = `UPDATE cliente SET ${setClause.join(', ')} WHERE id = $${paramIndex++}`;
        params.push(id);

        const result = await db.query(query, params);

        // En pg, el número de filas afectadas está en result.rowCount
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado o sin cambios.' });
        }

        // Auditoría
        const mensaje = `Edición de cliente ID ${id}`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({ // Cambiado a 200 para actualización exitosa
            message: 'Actualizado con éxito'
        });
    } catch (err) {
        console.error('Error al editar cliente:', err);
        next(err);
    }
};

// Eliminar cliente - DELETE
const eliminar = async (req, res, next) => {
    const id = req.params.id;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let querySelect = 'SELECT nombre_responsable, nombre_negocio FROM cliente WHERE id = $1';
        const { rows: cliente } = await db.query(querySelect, [id]);

        if (cliente.length === 0) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        const nombreCliente = cliente[0].nombre_responsable;
        const nombreLocal = cliente[0].nombre_negocio;

        let queryDelete = 'DELETE FROM cliente WHERE id = $1';
        const result = await db.query(queryDelete, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado o no se pudo eliminar.' });
        }

        // Auditoría
        const mensaje = `Eliminación de cliente: ${nombreCliente.replace(/'/g, "")}, Local: ${nombreLocal}`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Cliente eliminado correctamente'
        });
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        next(err);
    }
};


module.exports = {
    listar,
    detalle,
    crear,
    editar,
    eliminar
};