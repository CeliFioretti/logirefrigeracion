const db = require('../config/db.js')
const notificacionController = require('./notificaciones.controller.js');

const listar = async (req, res, next) => {
    const { modelo, tipo, fechaCompra, capacidad, estado, nserie, page, pageSize } = req.query;

    try {
        let query = `
            SELECT
                f.*,
                c.nombre_responsable AS nombre_responsable_cliente,
                c.id AS cliente_id_asociado
            FROM
                freezer f
            LEFT JOIN
                cliente c ON f.cliente_id = c.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM freezer f';

        let condiciones = [];
        let params = [];
        let countParams = [];

        if (modelo) {
            condiciones.push('f.modelo LIKE ?');
            params.push(`%${modelo}%`);
            countParams.push(`%${modelo}%`);
        }
        if (tipo) {
            condiciones.push('f.tipo LIKE ?');
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }
        if (fechaCompra) {
            condiciones.push('f.fecha_creacion LIKE ?');
            params.push(`%${fechaCompra}%`);
            countParams.push(fechaCompra);
        }
        if (capacidad) {
            condiciones.push('f.capacidad LIKE ?');
            params.push(`%${capacidad}%`);
            countParams.push(capacidad);
        }
        if (estado) {
            condiciones.push('f.estado LIKE ?');
            params.push(`%${estado}%`);
            countParams.push(`%${estado}%`);
        }
        if (nserie) {
            condiciones.push('f.numero_serie LIKE ?');
            params.push(`%${nserie}%`);
            countParams.push(`%${nserie}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY f.id ASC'

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSizeNum, offset);

        const [freezers] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        res.status(200).json({
            data: freezers,
            total: totalRegistros,
            message: freezers.length === 0 ? 'No se encontraron freezers con los criterios especificados.' : undefined
        });

    } catch (error) {
        console.error("Error en listar freezers:", error);
        next(error);
    }
};

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
        // Validación de campos obligatorios
        if (!numero_serie || numero_serie.trim() === '' ||
            !modelo || modelo.trim() === '' ||
            !tipo || tipo.trim() === '' ||
            capacidad === undefined || isNaN(capacidad)) {
            return res.status(400).json({ error: 'Faltan campos obligatorios por rellenar (número de serie, modelo, tipo, capacidad).' });
        }

        if (!/^[a-zA-Z0-9- ]+$/.test(numero_serie)) {
            return res.status(400).json({ error: 'El número de serie contiene caracteres no válidos. Solo se permiten letras, números, guiones y espacios.' });
        }

        const clienteAsignado = cliente_id && !isNaN(cliente_id) ? Number(cliente_id) : null;

        // Lógica para determinar el estado final basado en cliente_id
        let estadoFinal = estado; 

        if (clienteAsignado) {
            estadoFinal = "Asignado"; // Si hay cliente, el estado es "Asignado"
        } else {
            // Si no hay cliente, el estado no puede ser "Asignado"
            if (estadoFinal === "Asignado") {
                estadoFinal = "Disponible"; // Forzamos a Disponible si se envió Asignado sin cliente
            }
            // Si es Baja o Mantenimiento sin cliente, se mantiene 
            if (!estadoFinal) { // Si el estado no se especificó y no hay cliente
                estadoFinal = "Disponible";
            }
        }

        const estadosValidos = ["Disponible", "Asignado", "Baja", "Mantenimiento"];
        if (!estadosValidos.includes(estadoFinal)) {
            return res.status(400).json({ error: 'Estado de freezer inválido.' });
        }

        // Validaciones adicionales para la creación
        if (clienteAsignado && (estadoFinal === "Baja" || estadoFinal === "Mantenimiento")) {
            return res.status(400).json({ error: 'Un freezer asignado a un cliente no puede estar en Baja o Mantenimiento.' });
        }
        if (clienteAsignado === null && estadoFinal === "Asignado") {
            return res.status(400).json({ error: 'Un freezer no puede estar en estado "Asignado" sin un cliente.' });
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
        console.error("Error al crear freezer:", err);
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
        "fecha_creacion",
        "marca",
        "capacidad",
        "estado",
        "imagen"
    ];

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const [[freezerAnterior]] = await db.promise().query('SELECT cliente_id, estado, numero_serie FROM freezer WHERE id = ?', [id]);

        if (!freezerAnterior) {
            return res.status(404).json({ error: 'Freezer no encontrado.' });
        }

        let setClause = [];
        let params = [];
        let nuevoEstado = req.body.estado; 
        let nuevoClienteId = req.body.cliente_id === undefined ? freezerAnterior.cliente_id : (req.body.cliente_id === null || req.body.cliente_id === '' ? null : Number(req.body.cliente_id));


        
        if (req.body.cliente_id !== undefined) { 
            if (nuevoClienteId !== null) {
                nuevoEstado = "Asignado";
            } else {
                if (freezerAnterior.estado === "Asignado") {
                    nuevoEstado = "Disponible";
                }
            }
        }

        // Si el estado se envía en el body y no es undefined, usamos ese valor,
        // a menos que la lógica de cliente_id lo haya forzado.
        if (req.body.estado !== undefined && nuevoEstado === undefined) {
            nuevoEstado = req.body.estado;
        } else if (nuevoEstado === undefined) { // Si no se envió estado, usamos el estado anterior
            nuevoEstado = freezerAnterior.estado;
        }


        const estadosValidos = ["Disponible", "Asignado", "Baja", "Mantenimiento"];
        if (!estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({ error: 'Estado de freezer inválido.' });
        }

        // Validaciones de reglas de negocio para la edición
        // Regla: Un freezer con cliente no puede estar en estado "Disponible".
        if (nuevoClienteId !== null && nuevoEstado === "Disponible") {
            return res.status(400).json({ error: 'Un freezer con un cliente asignado no puede estar en estado "Disponible".' });
        }
        // Regla: Un freezer sin cliente no puede estar en estado "Asignado".
        if (nuevoClienteId === null && nuevoEstado === "Asignado") {
            return res.status(400).json({ error: 'Un freezer sin cliente asignado no puede estar en estado "Asignado".' });
        }

        // Regla CRÍTICA: Si el freezer *tenía* un cliente asignado (antes de la edición),
        // no puede cambiar a "Baja" o "Mantenimiento" *sin antes desasignar al cliente*.
        // Esto significa que si `freezerAnterior.cliente_id` NO es null, y el `nuevoClienteId`
        // sigue siendo NO null, y el `nuevoEstado` es "Baja" o "Mantenimiento", entonces es un error.
        // O si el cliente_id no ha cambiado (sigue asignado) y se intenta cambiar el estado a Baja/Mantenimiento.
        if (freezerAnterior.cliente_id !== null && nuevoClienteId !== null && (nuevoEstado === "Baja" || nuevoEstado === "Mantenimiento")) {
             return res.status(400).json({ error: 'Primero debe desasignar el cliente para poder cambiar el estado a "Baja" o "Mantenimiento".' });
        }


        // Construcción de la cláusula SET
        campos.forEach(campo => {
            let valorCampo = req.body[campo];

            if (campo === 'estado') {
                setClause.push(`${campo} = ?`);
                params.push(nuevoEstado);
            } else if (campo === 'cliente_id') {
                setClause.push(`${campo} = ?`);
                params.push(nuevoClienteId);
            } else if (valorCampo !== undefined) {
                if (campo === 'capacidad') {
                    setClause.push(`${campo} = ?`);
                    params.push(Number(valorCampo));
                } else {
                    setClause.push(`${campo} = ?`);
                    params.push(valorCampo);
                }
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
        }

        const query = `UPDATE freezer SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(id);
        await db.promise().query(query, params);

        const mensajeAuditoria = `Edición de freezer ID ${id}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]);

        // Notificación si el freezer se asignó a un nuevo cliente.
        if (nuevoClienteId !== null && nuevoClienteId !== freezerAnterior.cliente_id) {
            const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [nuevoClienteId]);
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Freezer asignado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} ha sido asignado al cliente ${cliente?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        // Notificación si el freezer fue desasignado de un cliente.
        if (nuevoClienteId === null && freezerAnterior.cliente_id !== null) {
            const [[clienteAnterior]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [freezerAnterior.cliente_id]);
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Freezer desasignado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} ha sido desasignado del cliente ${clienteAnterior?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        // Notificación si el estado cambió a "Baja" o "Mantenimiento" (y antes no tenía cliente o se desasignó).
        // Se activa si el estado anterior no era Baja/Mantenimiento y el nuevo sí lo es, Y no tiene cliente asignado.
        if ((nuevoEstado === "Baja" || nuevoEstado === "Mantenimiento") && nuevoEstado !== freezerAnterior.estado && nuevoClienteId === null) {
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Estado de freezer actualizado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} cambió su estado a ${nuevoEstado}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }


        res.status(200).json({
            message: 'Freezer actualizado con éxito.'
        });


    } catch (err) {
        console.error("Error al editar freezer:", err);
        next(err);
    }
};


const eliminar = async (req, res, next) => {
    const id = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const [freezers] = await db.promise().query('SELECT id, numero_serie, cliente_id FROM freezer WHERE id = ?', [id]);

        if (freezers.length === 0) {
            return res.status(404).json({
                message: 'Freezer no encontrado'
            });
        }

        const freezer = freezers[0];
        const nserieFreezer = freezer.numero_serie;

        if (freezer.cliente_id !== null) {
            return res.status(409).json({
                message: 'No se puede eliminar el freezer porque está asignado a un cliente. Primero debe desasignarlo.'
            });
        }

        await db.promise().query('DELETE FROM freezer WHERE id = ?', [id]);

        const mensaje = `Eliminación de freezer con nº de serie: ${nserieFreezer.replace(/'/g, "")} (ID: ${id})`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Freezer eliminado correctamente'
        });
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

const desasignarFreezer = async (req, res, next) => {
    const id = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const [freezers] = await db.promise().query('SELECT id, numero_serie, cliente_id, estado FROM freezer WHERE id = ?', [id])

        if (freezers.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        const freezer = freezers[0];
        const nserieFreezer = freezer.numero_serie;

        if (freezer.cliente_id === null || freezer.estado === 'Disponible') {
            return res.status(400).json({ error: 'El freezer ya no está asignado o está disponible' });
        }

        await db.promise().query('UPDATE freezer SET cliente_id = NULL, estado = "Disponible" WHERE id = ?', [id]);

        const mensaje = `Desasignación de freezer ID ${id} (N° Serie: ${nserieFreezer.replace(/'/g, "")})`;
        await db.promise().query(`
            INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
            VALUES (?, ?, NOW(), ?)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Freezer desasignado correctamente' });


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
    const { id } = req.params;
    const { usuario_nombre, fechaDesde, fechaHasta, tipo, page, pageSize } = req.query

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
    obtenerMantenimientosPropios,
    desasignarFreezer
}
