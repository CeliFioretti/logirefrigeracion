const db = require('../config/db.js')

// Obtener registro completo de clientes
const listar = async (req, res, next) => {
    const { nombreCliente, tipoNegocio, nombreNegocio, cuit, page, pageSize } = req.query;

    try {
        let query = 'SELECT * FROM cliente';
        let countQuery = 'SELECT COUNT(*) as total FROM cliente'

        let condiciones = [];
        let params = [];
        let countParams = [];

        if (nombreCliente) {
            condiciones.push('nombre_responsable LIKE ?');
            params.push(`%${nombreCliente}%`);
            countParams.push(`%${nombreCliente}%`);
        }
        if (tipoNegocio) {
            condiciones.push('tipo_negocio LIKE ?');
            params.push(`%${tipoNegocio}%`);
            countParams.push(`%${tipoNegocio}%`);
        }
        if (nombreNegocio) {
            condiciones.push('nombre_negocio LIKE ?');
            params.push(`%${nombreNegocio}%`);
            countParams.push(`%${nombreNegocio}%`);
        }
        if (cuit) {
            condiciones.push("REPLACE(cuit, '-', '') LIKE ?");
            params.push(`%${cuit}%`);
            countParams.push(`%${cuit}%`);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
            countQuery += ' WHERE ' + condiciones.join(' AND '); 
        }

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT ? OFFSET ?`
        params.push(pageSizeNum, offset);

        const [clientes] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        if (clientes.length === 0) {
            res.status(200).json({
                message: 'No hay registros de clientes actualmente',
                data: []
            })
        } else {
            res.status(200).json({
                data: clientes,
                total: totalRegistros,
                message: clientes.length === 0 ? 'No se encontraron freezers con los criterios especificados.' : undefined
            })
        }

    } catch (error) {
        next(error)
    }

}

// Obtiene los detalles de un cliente
const detalle = async (req, res, next) => {
    const idCliente = req.params.id;

    try {
        let clienteQuery = 'SELECT id, cuit, nombre_negocio, nombre_responsable, DATE_FORMAT(fecha_registro, "%d-%m-%Y") as fecha_registro, telefono, correo, direccion, tipo_negocio, imagen FROM cliente WHERE id = ?'
        const [clienteResults] = await db.promise().query(clienteQuery, [idCliente]);

        if (clienteResults.length === 0) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            })
        }

        const cliente = clienteResults[0];

        let freezerQuery = 'SELECT id, numero_serie, modelo, marca, tipo, capacidad, estado, imagen FROM freezer WHERE cliente_id = ?'
        const [freezersResults] = await db.promise().query(freezerQuery, [idCliente]);

        res.status(200).json({
            data: {
                cliente: cliente,
                freezersAsignados: freezersResults,
                totalFreezers: freezersResults.length
            }
        })
        
    } catch (err) {
        console.error('Error al obtener detalles del cliente:', err)
        next(err)
    }
}

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
    }

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        for (const [clave, valor] of Object.entries(campos)) {
            if (!valor || valor.trim() === "") {
                return res.status(400).json({
                    error: `El campo "${clave}" es obligatirio`
                })
            }
        }
        
        const query = `INSERT INTO cliente (cuit, nombre_negocio, nombre_responsable, fecha_registro, telefono, correo, direccion, tipo_negocio) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`;

        const valores = Object.values(campos);

        await db.promise().query(query, valores);

        // Auditoría
        const mensaje = `Registro de nuevo cliente: ${nombre_responsable.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Cliente creado con éxito'
        })
    } catch (err) {
        next(err);
    }
}

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
    ]
    

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;
    

    try {

        let setClause = [];
        let params = [];

        campos.forEach(campo => {
            if (req.body[campo] !== undefined && req.body[campo].trim() !== "") {
                setClause.push(`${campo} = ?`);
                params.push(req.body[campo]);
            }
        })

        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No se proporcionó ningún campo para actualizar' });
        } 

        const query = `UPDATE cliente SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.promise().query(query, params);

        // Auditoría
        const mensaje = `Edición de cliente ID ${id}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Actualizado con éxito'
        })
    } catch (err) {
        next(err);
    }
}

// Eliminar zona - DELETE
const eliminar = async (req, res, next) => {
    const id = req.params.id;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let querySelect = 'SELECT * FROM cliente WHERE id = ?';
        let queryDelete = 'DELETE FROM cliente WHERE id =?';

        const [cliente] = await db.promise().query(querySelect, [id]);

        if (cliente.length === 0) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            })
        }

        const nombreCliente = cliente[0].nombre_responsable;
        const nombreLocal = cliente[0].nombre_negocio;

        await db.promise().query(queryDelete, [id])

        // Auditoría
        const mensaje = `Eliminación de cliente: ${nombreCliente.replace(/'/g, "")}, Local: ${nombreLocal}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable,mensaje]);

        res.status(200).json({
            message: 'Cliente eliminado correctamente'
        })
    } catch (err) {
        next(err);
    }

}

// Obtener el cliente con más freezers - GET
const getClienteConMasFreezers = async (req, res, next) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT
                c.id,
                c.nombre_responsable,
                c.nombre_negocio,
                COUNT(f.id) AS total_freezers
            FROM
                cliente c
            LEFT JOIN
                freezer f ON c.id = f.cliente_id
            GROUP BY
                c.id, c.nombre_responsable, c.nombre_negocio
            ORDER BY
                total_freezers DESC
            LIMIT 1;
        `);

        if (rows.length > 0) {
            res.status(200).json({
                success: true,
                data: rows[0], 
                message: 'Cliente con más freezers obtenido exitosamente.'
            });
        } else {
            res.status(200).json({ // Cambiado a 200 para indicar que la consulta fue exitosa, pero no hay datos
                success: true,
                data: null, // No se encontraron clientes o freezers asignados
                message: 'No se encontraron clientes o freezers asignados.'
            });
        }

    } catch (error) {
        console.error('Error al obtener el cliente con más freezers:', error);
        next(error); 
    }
};

module.exports = {
    listar,
    detalle,
    crear,
    editar,
    eliminar,
    getClienteConMasFreezers
}