const db = require('../config/db.js')
const notificacionController = require('./notificaciones.controller.js');


const listar = async (req, res, next) => {
    const { modelo, tipo, fechaCompra, capacidad, estado, nserie, page, pageSize } = req.query;

    try {
        let query = 'SELECT * FROM freezer';
        let countQuery = 'SELECT COUNT(*) as total FROM freezer';

        let condiciones = [];
        let params = [];
        let countParams = [];

        if (modelo) {
            condiciones.push('modelo LIKE ?');
            params.push(`%${modelo}%`);
            countParams.push(`%${modelo}%`);
        }
        if (tipo) {
            condiciones.push('tipo LIKE ?');
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }
        if (fechaCompra) {
            condiciones.push('fecha_creacion LIKE ?');
            params.push(`%${fechaCompra}%`);
            countParams.push(fechaCompra);
        }
        if (capacidad) {
            condiciones.push('capacidad LIKE ?');
            params.push(`%${capacidad}%`);
            countParams.push(capacidad);
        }
        if (estado) {
            condiciones.push('estado LIKE ?');
            params.push(`%${estado}%`);
            countParams.push(`%${estado}%`);
        }
        if (nserie) {
            condiciones.push('numero_serie LIKE ?');
            params.push(`%${nserie}%`);
            countParams.push(`%${nserie}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += ' WHERE ' + condiciones.join(' AND ');
            countQuery += whereClause;
        }

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSizeNum, offset);

        const [freezers] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;


        if (freezers.length === 0) {
            res.status(200).json({
                message: 'No hay registros de usuario actualmente',
                data: []
            })
        } else {
            res.status(200).json({
                data: freezers,
                total: totalRegistros,
                message: freezers.length === 0 ? 'No se encontraron freezers con los criterios especificados.' : undefined
            })
        }

    } catch (error) {
        next(error)
    }

}

const detalle = async (req, res, next) => {
    const idFreezer = req.params.id;

    try {
        let query = 'SELECT * FROM freezer WHERE id = ?';
        const [results] = await db.promise().query(query, [idFreezer])

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros del usuario',
                data: []
            });
        } else {
            res.status(200).json({
                data: results[0]
            });
        }
    } catch (err) {
        next(err)
    }
}

const crear = async (req, res, next) => {
    const {
        cliente_id,
        numero_serie,
        modelo,
        tipo,
        marca,
        capacidad,
        estado,
        imagen
    } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        if (!numero_serie || numero_serie.trim() === '' ||
            !modelo || modelo.trim() === '' ||
            !tipo || tipo.trim() === '' ||
            capacidad === undefined || isNaN(capacidad)) {
            return res.status(400).json({ error: 'Faltan campos por rellenar' });
        }

        if (!numero_serie.match(/^[a-zA-Z0-9-]+$/)) {
            return res.status(400).json({ error: 'El número de serie contiene caracteres no válidos' });
        }

        const clienteAsignado = cliente_id && !isNaN(cliente_id) ? Number(cliente_id) : null;

        const estadosValidos = ["Disponible", "Asignado", "Baja", "Mantenimiento"];
        let estadoFinal = estado?.trim() || "";

        if (clienteAsignado && (estadoFinal === "Baja" || estadoFinal === "Mantenimiento")) {
            return res.status(400).json({ error: 'Un freezer asignado a un cliente no puede estar en Baja o Mantenimiento' });
        }

        if (clienteAsignado) {
            estadoFinal = "Asignado";
        } else if ( estadoFinal === "Asignado"  && clienteAsignado === null ) {
            return res.status(400).json({ error: 'Un freezer no puede estar asignado sin un cliente' });
        }
        else if (!estadoFinal) {
            estadoFinal = "Disponible";
        }

        if (!estadosValidos.includes(estadoFinal)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const marcaAsignada = marca?.trim() || null;
        const imagenAsignada = imagen?.trim() || null;

        const query = `INSERT INTO freezer (cliente_id, numero_serie, modelo, tipo, fecha_creacion, marca, capacidad, estado, imagen) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`;

        await db.promise().query(query, [clienteAsignado, numero_serie, modelo, tipo, marcaAsignada, capacidad, estadoFinal, imagenAsignada]);

        const mensaje = `Se creó un nuevo freezer: Número de serie ${numero_serie}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        if (clienteAsignado) {
            const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [clienteAsignado]);
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Nuevo freezer asignado`,
                mensaje: `El freezer ${numero_serie} ha sido asignado al cliente ${cliente?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: null
            });
        }

        res.status(201).json({
            message: 'Freezer creado correctamente'
        });
    } catch (err) {
        next(err);
    }
};

const editar = async (req, res, next) => {
    const id = req.params.id;

    const campos = [
        "cliente_id",
        "numero_serie",
        "modelo",
        "tipo",
        "marca",
        "capacidad",
        "estado",
        "imagen"
    ];

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let setClause = [];
        let params = [];

        campos.forEach(campo => {
            if (req.body[campo] !== undefined && req.body[campo] !== "") {
                setClause.push(`${campo} = ?`);
                params.push(req.body[campo].trim() === "" ? null : req.body[campo]);
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No se proporcionó ningún campo para actualizar' });
        }

        const { cliente_id, estado } = req.body;
        const estadosValidos = ["Disponible", "Asignado", "Baja", "Mantenimiento"];

        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        if (cliente_id && estado === "Disponible") {
            return res.status(400).json({ error: 'Un freezer con cliente no puede estar en estado Disponible' });
        }

        const [[freezerAnterior]] = await db.promise().query('SELECT cliente_id, estado, numero_serie FROM freezer WHERE id = ?', [id]);

        const query = `UPDATE freezer SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(id);
        await db.promise().query(query, params);

        const mensaje = `Edición de freezer ID ${id}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        if (cliente_id && cliente_id !== freezerAnterior.cliente_id) {
            const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [cliente_id]);
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Nuevo freezer asignado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} ha sido asignado al cliente ${cliente?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        if (estado && (estado === "Baja" || estado === "Mantenimiento") && freezerAnterior.cliente_id) {
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Estado de freezer actualizado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} cambió su estado a ${estado}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        res.status(201).json({
            message: 'Actualizado con éxito'
        });
    } catch (err) {
        next(err);
    }
};


const eliminar = async (req, res, next) => {
    const id = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let querySelect = 'SELECT * FROM freezer WHERE id = ?';
        let queryDelete = 'DELETE FROM freezer WHERE id =?';

        const [freezer] = await db.promise().query(querySelect, [id]);

        if (freezer.length === 0) {
            return res.status(404).json({
                message: 'Freezer no encontrado'
            })
        }

        const nserieFreezer = freezer[0].numero_serie;

        await db.promise().query(queryDelete, [id])

        const mensaje = `Eliminación de freezer con nº: ${nserieFreezer.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Freezer eliminado correctamente'
        })
    } catch (err) {
        next(err);
    }

}

const asignarFreezer = async (req, res, next) => {
    const id = req.params.id;
    const { cliente_id } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const [freezer] = await db.promise().query('SELECT estado FROM freezer WHERE id = ?', [id]);

        if (freezer.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        if (freezer[0].estado !== 'Disponible') {
            return res.status(400).json({ error: 'El freezer no está disponible para asignación' });
        }

        await db.promise().query('UPDATE freezer SET cliente_id = ?, estado = "Asignado" WHERE id = ?', [cliente_id, id]);

        const mensaje = `Asignación de freezer ID ${id} al cliente ID ${cliente_id}`;
        await db.promise().query(`
            INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
            VALUES (?, ?, NOW(), ?)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Freezer asignado correctamente' });

    } catch (err) {
        next(err);
    }
};

const freezersPorCliente = async (req, res, next) => {
    const idCliente = req.params.id;

    try {
        let query = `
        SELECT f.id, f.numero_serie, f.modelo, f.tipo, f.fecha_creacion,
        f.marca, f.capacidad, f.estado, f.imagen
        FROM freezer f
        WHERE f.cliente_id = ?
        `

        const [resultados] = await db.promise().query(query, [idCliente])

        if (resultados.length === 0) {
            return res.status(200).json({
                message: 'No se encontraron freezers registrados para este cliente',
                data: []
            })
        }

        res.status(200).json({
            data: resultados
        })


    } catch (error) {
        next(error)
    }
}

const liberar = async (req, res, next) => {

    const id = req.params.id;
    const idUsuario = req.usuario.id;
    const nombreUsuario = req.usuario.nombre;

    try {
        const [freezer] = await db.promise().query('SELECT * FROM freezer WHERE id = ?', [id]);
        if (freezer.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        await db.promise().query('UPDATE freezer SET cliente_id = NULL, estado = "Disponible" WHERE id = ?', [id]);

        const mensaje = `Se desasignó el freezer con ID ${id}`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuario, nombreUsuario, mensaje]
        );

        res.status(200).json({ message: 'Freezer liberado correctamente' });
    } catch (err) {
        next(err);
    }
};

const obtenerMantenimientosPropios = async (req, res, next) => {
    const {id} = req.params;
    const {usuario_nombre, fechaDesde, fechaHasta, tipo, page, pageSize} = req.query

    try {
        let query = 'SELECT * from mantenimiento WHERE freezer_id = ?'
        let countQuery = 'SELECT COUNT(*) as total FROM mantenimiento WHERE freezer_id = ?';

        let condiciones = [];
        let params = [id];
        let countParams = [id];

        if (usuario_nombre) {
            condiciones.push('usuario_nombre LIKE ?');
            params.push(`%${usuario_nombre}%`);
            countParams.push(`%${usuario_nombre}%`);
        }
        if (fechaDesde) {
            condiciones.push('fecha >= ?');
            params.push(`${fechaDesde} 00:00:00`);
            countParams.push(`${fechaDesde} 00:00:00`);
        }
        if (fechaHasta) {
            condiciones.push('fecha <= ?');
            params.push(`${fechaHasta} 23:59:59`);
            countParams.push(`${fechaHasta} 23:59:59`);
        }
        if (tipo) {
            condiciones.push('tipo LIKE ?');
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' AND ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY fecha DESC';

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSizeNum, offset);

        const [mantenimientos] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;


        if (mantenimientos.length === 0 && condiciones.length > 0) {

            return res.status(200).json({
                message: 'No se encontraron mantenimientos para este freezer con los criterios especificados.',
                data: [],
                total: 0
            });
        } else if (mantenimientos.length === 0) {
            return res.status(200).json({
                message: 'No existen mantenimientos para este freezer.',
                data: [],
                total: 0
            });
        }

        res.status(200).json({
            data: mantenimientos,
            total: totalRegistros
        });

    } catch (err) {
        console.error('Error al obtener mantenimientos del freezer:', err);
        next(err)
    }

}



module.exports = {
    listar,
    detalle,
    crear,
    editar,
    eliminar,
    freezersPorCliente,
    asignarFreezer,
    liberar,
    obtenerMantenimientosPropios
}