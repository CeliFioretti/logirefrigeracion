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
        let paramIndex = 1; // Para los parámetros de las condiciones

        if (modelo) {
            condiciones.push(`f.modelo ILIKE $${paramIndex++}`);
            params.push(`%${modelo}%`);
            countParams.push(`%${modelo}%`);
        }
        if (tipo) {
            condiciones.push(`f.tipo ILIKE $${paramIndex++}`);
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }
        if (fechaCompra) {
            // Asumiendo que fechaCompra es una fecha en formato 'YYYY-MM-DD'
            condiciones.push(`f.fecha_creacion::text ILIKE $${paramIndex++}`);
            params.push(`%${fechaCompra}%`);
            countParams.push(`%${fechaCompra}%`);
        }
        if (capacidad) {
            condiciones.push(`f.capacidad = $${paramIndex++}`); // Capacidad es numérica, no LIKE
            params.push(parseInt(capacidad));
            countParams.push(parseInt(capacidad));
        }
        if (estado) {
            condiciones.push(`f.estado ILIKE $${paramIndex++}`);
            params.push(`%${estado}%`);
            countParams.push(`%${estado}%`);
        }
        if (nserie) {
            condiciones.push(`f.numero_serie ILIKE $${paramIndex++}`);
            params.push(`%${nserie}%`);
            countParams.push(`%${nserie}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY f.id ASC';

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);
        countParams.push(pageSizeNum, offset); // Aunque no se usa LIMIT/OFFSET en count, mantenemos la coherencia si se necesitara

        const { rows: freezers } = await db.query(query, params);
        const { rows: totalResult } = await db.query(countQuery, countParams.slice(0, countParams.length - 2)); // Eliminar LIMIT/OFFSET para el conteo
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
        let query = 'SELECT * FROM freezer WHERE id = $1';
        const { rows: results } = await db.query(query, [idFreezer])

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros del freezer',
                data: []
            });
        } else {
            res.status(200).json({
                data: results[0]
            });
        }
    } catch (err) {
        console.error("Error en detalle de freezer:", err);
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
        } else if (estadoFinal === "Asignado" && clienteAsignado === null) {
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

        // Insertar el freezer y obtener el ID
        const { rows: insertResult } = await db.query(
            `INSERT INTO freezer (cliente_id, numero_serie, modelo, tipo, fecha_creacion, marca, capacidad, estado, imagen) 
             VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8) RETURNING id`,
            [clienteAsignado, numero_serie, modelo, tipo, marcaAsignada, capacidad, estadoFinal, imagenAsignada]
        );
        const freezerId = insertResult[0].id;

        const mensaje = `Se creó un nuevo freezer: Número de serie ${numero_serie} (ID: ${freezerId})`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        if (clienteAsignado) {
            const { rows: clienteRows } = await db.query('SELECT nombre_responsable FROM cliente WHERE id = $1', [clienteAsignado]);
            const cliente = clienteRows.length > 0 ? clienteRows[0] : null;
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Nuevo freezer asignado`,
                mensaje: `El freezer ${numero_serie} ha sido asignado al cliente ${cliente?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: freezerId // Usar el ID del freezer recién creado
            });
        }

        res.status(201).json({
            message: 'Freezer creado correctamente',
            freezerId: freezerId
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
        "fecha_creacion", // Aunque no se edita directamente, se mantiene para la lógica de campos
        "marca",
        "capacidad",
        "estado",
        "imagen"
    ];

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: freezerAnteriorResult } = await db.query('SELECT cliente_id, estado, numero_serie FROM freezer WHERE id = $1', [id]);

        if (freezerAnteriorResult.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado.' });
        }
        const freezerAnterior = freezerAnteriorResult[0];

        let setClause = [];
        let params = [];
        let paramCounter = 1; // Para los parámetros de la cláusula SET
        let cambiosDetectados = false;
        let mensajeAuditoriaPartes = [];

        // Nuevo estado y cliente_id del body
        const nuevoEstado = req.body.estado;
        const nuevoClienteId = req.body.cliente_id === null || req.body.cliente_id === '' ? null : Number(req.body.cliente_id);

        // Validaciones de estado y cliente_id
        const estadosValidos = ["Disponible", "Asignado", "Baja", "Mantenimiento"];

        if (nuevoEstado !== undefined && !estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({ error: 'Estado de freezer inválido.' });
        }

        // Regla: Un freezer con cliente no puede estar en estado "Disponible".
        if (nuevoClienteId !== null && nuevoEstado === "Disponible") {
            return res.status(400).json({ error: 'Un freezer con un cliente asignado no puede estar en estado "Disponible".' });
        }
        // Regla: Un freezer sin cliente no puede estar en estado "Asignado".
        if (nuevoClienteId === null && nuevoEstado === "Asignado") {
            return res.status(400).json({ error: 'Un freezer sin cliente asignado no puede estar en estado "Asignado".' });
        }

        // Si el freezer tiene cliente, no puede ir a Baja o Mantenimiento directamente.
        if (freezerAnterior.cliente_id !== null && (nuevoEstado === "Baja" || nuevoEstado === "Mantenimiento")) {
            return res.status(400).json({ error: 'Primero debe desasignar el cliente para poder cambiar el estado a "Baja" o "Mantenimiento".' });
        }

        // Construcción de cláusula SET para la consulta UPDATE
        for (const campo of campos) {
            let valorCampo = req.body[campo];

            // Solo procesar si el campo está presente en el body
            if (req.body.hasOwnProperty(campo)) {
                let valorActualEnDB = freezerAnterior[campo]; // Suponiendo que freezerAnterior tiene todos los campos

                // Manejo especial para cliente_id y capacidad (conversión a número)
                if (campo === 'cliente_id') {
                    valorCampo = (valorCampo === null || valorCampo === '') ? null : Number(valorCampo);
                } else if (campo === 'capacidad') {
                    valorCampo = Number(valorCampo);
                }

                // Comparar con el valor actual en la DB para detectar cambios
                if (valorCampo !== valorActualEnDB) {
                    setClause.push(`${campo} = $${paramCounter++}`);
                    params.push(valorCampo);
                    cambiosDetectados = true;
                    mensajeAuditoriaPartes.push(`${campo}: '${valorActualEnDB}' -> '${valorCampo}'`);
                }
            }
        }

        // Si no se pasan campos para actualizar o no hay cambios
        if (!cambiosDetectados) {
            return res.status(200).json({ message: 'No se proporcionaron campos para actualizar o no hay cambios detectados.' });
        }

        const query = `UPDATE freezer SET ${setClause.join(', ')} WHERE id = $${paramCounter++}`;
        params.push(id);
        await db.query(query, params);

        const mensajeAuditoria = `Edición de freezer ID ${id} (N° Serie: ${freezerAnterior.numero_serie}). Cambios: ${mensajeAuditoriaPartes.join(', ')}.`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]);

        // Notificación si el freezer se asignó a un nuevo cliente.
        if (nuevoClienteId !== null && nuevoClienteId !== freezerAnterior.cliente_id) {
            const { rows: clienteRows } = await db.query('SELECT nombre_responsable FROM cliente WHERE id = $1', [nuevoClienteId]);
            const cliente = clienteRows.length > 0 ? clienteRows[0] : null;
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Nuevo freezer asignado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} ha sido asignado al cliente ${cliente?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        // Notificación si el freezer fue desasignado de un cliente.
        if (nuevoClienteId === null && freezerAnterior.cliente_id !== null) {
            const { rows: clienteAnteriorRows } = await db.query('SELECT nombre_responsable FROM cliente WHERE id = $1', [freezerAnterior.cliente_id]);
            const clienteAnterior = clienteAnteriorRows.length > 0 ? clienteAnteriorRows[0] : null;
            await notificacionController.crear({
                usuario_id: idUsuarioResponsable,
                titulo: `Freezer desasignado`,
                mensaje: `El freezer ${freezerAnterior.numero_serie} ha sido desasignado del cliente ${clienteAnterior?.nombre_responsable || 'N/A'}.`,
                tipo: 'freezer',
                referencia_tipo: 'freezer',
                referencia_id: Number(id)
            });
        }

        // Notificación si el estado cambió a "Baja" o "Mantenimiento" (y antes tenía un cliente).
        if (nuevoEstado && (nuevoEstado === "Baja" || nuevoEstado === "Mantenimiento") &&
            freezerAnterior.cliente_id !== null && nuevoEstado !== freezerAnterior.estado) {
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
        console.error('Error al editar el freezer:', err);
        next(err);
    }
};


const eliminar = async (req, res, next) => {
    const id = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: freezers } = await db.query('SELECT id, numero_serie, cliente_id FROM freezer WHERE id = $1', [id]);

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

        await db.query('DELETE FROM freezer WHERE id = $1', [id]);

        const mensaje = `Eliminación de freezer con nº de serie: ${nserieFreezer.replace(/'/g, "")} (ID: ${id})`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1, $2, NOW(), $3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Freezer eliminado correctamente'
        });
    } catch (err) {
        console.error('Error al eliminar freezer:', err);
        next(err);
    }

}

const asignarFreezer = async (req, res, next) => {
    const id = req.params.id;
    const { cliente_id } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: freezer } = await db.query('SELECT estado FROM freezer WHERE id = $1', [id]);

        if (freezer.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        if (freezer[0].estado !== 'Disponible') {
            return res.status(400).json({ error: 'El freezer no está disponible para asignación' });
        }

        await db.query('UPDATE freezer SET cliente_id = $1, estado = \'Asignado\' WHERE id = $2', [cliente_id, id]);

        const mensaje = `Asignación de freezer ID ${id} al cliente ID ${cliente_id}`;
        await db.query(`
            INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
            VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Freezer asignado correctamente' });

    } catch (err) {
        console.error('Error al asignar freezer:', err);
        next(err);
    }
};

const desasignarFreezer = async (req, res, next) => {
    const id = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: freezers } = await db.query('SELECT id, numero_serie, cliente_id, estado FROM freezer WHERE id = $1', [id])

        if (freezers.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        const freezer = freezers[0];
        const nserieFreezer = freezer.numero_serie;

        if (freezer.cliente_id === null || freezer.estado === 'Disponible') {
            return res.status(400).json({ error: 'El freezer ya no está asignado o está disponible' });
        }

        await db.query('UPDATE freezer SET cliente_id = NULL, estado = \'Disponible\' WHERE id = $1', [id]);

        const mensaje = `Desasignación de freezer ID ${id} (N° Serie: ${nserieFreezer.replace(/'/g, "")})`;
        await db.query(`
            INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
            VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Freezer desasignado correctamente' });


    } catch (err) {
        console.error('Error al desasignar freezer:', err);
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
        WHERE f.cliente_id = $1
        `

        const { rows: resultados } = await db.query(query, [idCliente])

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
        console.error('Error al obtener freezers por cliente:', error);
        next(error)
    }
}

const liberar = async (req, res, next) => {

    const id = req.params.id;
    const idUsuario = req.usuario.id;
    const nombreUsuario = req.usuario.nombre;

    try {
        const { rows: freezer } = await db.query('SELECT * FROM freezer WHERE id = $1', [id]);
        if (freezer.length === 0) {
            return res.status(404).json({ error: 'Freezer no encontrado' });
        }

        await db.query('UPDATE freezer SET cliente_id = NULL, estado = \'Disponible\' WHERE id = $1', [id]);

        const mensaje = `Se desasignó el freezer con ID ${id}`;
        await db.query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES ($1, $2, NOW(), $3)',
            [idUsuario, nombreUsuario, mensaje]
        );

        res.status(200).json({ message: 'Freezer liberado correctamente' });
    } catch (err) {
        console.error('Error al liberar freezer:', err);
        next(err);
    }
};

const obtenerMantenimientosPropios = async (req, res, next) => {
    const { id } = req.params;
    const { usuario_nombre, fechaDesde, fechaHasta, tipo, page, pageSize } = req.query

    try {
        let query = 'SELECT * from mantenimiento WHERE freezer_id = $1'
        let countQuery = 'SELECT COUNT(*) as total FROM mantenimiento WHERE freezer_id = $1';

        let condiciones = [];
        let params = [id];
        let countParams = [id];
        let paramIndex = 2; // Empezamos con $2 para los parámetros de las condiciones

        if (usuario_nombre) {
            condiciones.push(`usuario_nombre ILIKE $${paramIndex++}`);
            params.push(`%${usuario_nombre}%`);
            countParams.push(`%${usuario_nombre}%`);
        }
        if (fechaDesde) {
            condiciones.push(`fecha >= $${paramIndex++}::timestamp`);
            params.push(`${fechaDesde} 00:00:00`);
            countParams.push(`${fechaDesde} 00:00:00`);
        }
        if (fechaHasta) {
            condiciones.push(`fecha <= $${paramIndex++}::timestamp`);
            params.push(`${fechaHasta} 23:59:59`);
            countParams.push(`${fechaHasta} 23:59:59`);
        }
        if (tipo) {
            condiciones.push(`tipo ILIKE $${paramIndex++}`);
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

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);
        // No necesitamos añadir LIMIT/OFFSET a countParams, ya que el COUNT no los usa.

        const { rows: mantenimientos } = await db.query(query, params);
        const { rows: totalResult } = await db.query(countQuery, countParams); // Usar countParams sin LIMIT/OFFSET
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