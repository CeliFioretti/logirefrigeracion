const db = require('../config/db');
const notificacionController = require('./notificaciones.controller.js');

// Lista todas las asignaciones de mantenimiento - GET
const listar = async (req, res, next) => {
    const { page, pageSize, usuario_nombre, freezer_numero_serie, estado, fechaDesde, fechaHasta } = req.query;

    try {
        let query = `
            SELECT
                am.id AS asignacion_id,
                am.fecha_creacion,
                am.fecha_asignacion,
                am.estado,
                am.observaciones AS asignacion_observaciones,
                am.tipo AS tipo_asignacion,
                u.id AS usuario_id,
                u.nombre_usuario AS usuario_nombre,
                u.correo AS usuario_correo,
                f.id AS freezer_id,
                f.numero_serie,
                f.modelo,
                f.tipo AS tipo_freezer,
                f.capacidad,
                c.nombre_responsable AS cliente_nombre,
                c.direccion AS cliente_direccion
            FROM asignacionmantenimiento am
            JOIN usuario u ON am.usuario_id = u.id
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
        `;
        let countQuery = `
            SELECT COUNT(am.id) as total
            FROM asignacionmantenimiento am
            JOIN usuario u ON am.usuario_id = u.id
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
        `;

        let condiciones = [];
        let params = [];
        let countParams = [];
        let paramIndex = 1;

        if (usuario_nombre) {
            condiciones.push(`u.nombre_usuario ILIKE $${paramIndex++}`);
            params.push(`%${usuario_nombre}%`);
            countParams.push(`%${usuario_nombre}%`);
        }
        if (freezer_numero_serie) {
            condiciones.push(`f.numero_serie ILIKE $${paramIndex++}`);
            params.push(`%${freezer_numero_serie}%`);
            countParams.push(`%${freezer_numero_serie}%`);
        }
        if (estado) {
            condiciones.push(`am.estado = $${paramIndex++}`);
            params.push(estado);
            countParams.push(estado);
        }
        if (fechaDesde) {
            condiciones.push(`am.fecha_asignacion >= $${paramIndex++}`);
            params.push(fechaDesde);
            countParams.push(fechaDesde);
        }
        if (fechaHasta) {
            condiciones.push(`am.fecha_asignacion <= $${paramIndex++}`);
            params.push(fechaHasta);
            countParams.push(fechaHasta);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // PostgreSQL no tiene FIELD, se ordena directamente por la columna de estado y luego por fecha
        query += ` ORDER BY 
            CASE am.estado
                WHEN 'pendiente' THEN 1
                WHEN 'vencida' THEN 2
                WHEN 'en curso' THEN 3
                WHEN 'completada' THEN 4
                WHEN 'cancelada' THEN 5
                ELSE 6
            END, am.fecha_asignacion ASC`;

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);

        const { rows: totalResult } = await db.query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        const { rows: asignaciones } = await db.query(query, params);

        if (asignaciones.length === 0 && totalRegistros === 0) {
            return res.status(200).json({
                message: 'No hay asignaciones de mantenimiento registradas.',
                data: [],
                total: 0
            });
        }

        res.status(200).json({
            data: asignaciones,
            total: totalRegistros
        });

    } catch (err) {
        console.error('Error al listar asignaciones de mantenimiento:', err);
        next(err);
    }
};

const crear = async (req, res, next) => {
    const { usuario_id, freezer_id, fecha_asignacion, observaciones, tipo_mantenimiento_asignado } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        if (!usuario_id || !freezer_id || !fecha_asignacion || !tipo_mantenimiento_asignado) {
            return res.status(400).json({ error: 'Faltan datos requeridos: usuario_id, freezer_id, fecha_asignacion, tipo_mantenimiento_asignado.' });
        }

        const { rows: resultado } = await db.query(
            `INSERT INTO asignacionmantenimiento
               (usuario_id, freezer_id, fecha_creacion, fecha_asignacion, estado, observaciones, tipo)
               VALUES ($1, $2, NOW(), $3, 'pendiente', $4, $5) RETURNING id`,
            [usuario_id, freezer_id, fecha_asignacion, observaciones || null, tipo_mantenimiento_asignado]
        );

        const idAsignacion = resultado[0].id;

        const { rows: operadorInfo } = await db.query('SELECT nombre_usuario FROM usuario WHERE id = $1', [usuario_id]);
        const nombreOperador = operadorInfo[0]?.nombre_usuario || 'Operador Desconocido';

        const { rows: freezerInfo } = await db.query('SELECT numero_serie FROM freezer WHERE id = $1', [freezer_id]);
        const numeroSerieFreezer = freezerInfo[0]?.numero_serie || 'Freezer Desconocido';

        await notificacionController.crear({
            usuario_id: usuario_id,
            titulo: 'Nueva Asignación de Mantenimiento',
            mensaje: `Se te ha asignado un mantenimiento para el freezer ${numeroSerieFreezer} (ID: ${freezer_id}) con fecha ${new Date(fecha_asignacion).toLocaleDateString()}.`,
            tipo: 'asignacion_mantenimiento',
            referencia_id: idAsignacion,
            referencia_tipo: 'asignacion_mantenimiento'
        });

        const mensaje = `Asignación de mantenimiento (ID: ${idAsignacion}) del freezer ${numeroSerieFreezer} (ID: ${freezer_id}) al operador ${nombreOperador} (ID: ${usuario_id}). Tipo: ${tipo_mantenimiento_asignado}.`;
        await db.query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
               VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(201).json({ message: 'Asignación creada con éxito', id: idAsignacion });

    } catch (err) {
        console.error('Error al crear asignación de mantenimiento:', err);
        next(err);
    }
};

const eliminar = async (req, res, next) => {
    const idAsignacion = req.params.id;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: asig } = await db.query('SELECT * FROM asignacionmantenimiento WHERE id = $1', [idAsignacion]);

        if (asig.length === 0) {
            return res.status(404).json({ error: 'Asignación no encontrada' });
        }

        const asignacion = asig[0];

        await db.query('DELETE FROM asignacionmantenimiento WHERE id = $1', [idAsignacion]);

        const mensaje = `Eliminación de asignación de mantenimiento ID ${idAsignacion} (operador ID ${asignacion.usuario_id}, freezer ID ${asignacion.freezer_id}) por ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}).`;
        await db.query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
               VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({
            message: 'Asignación eliminada correctamente'
        });
    } catch (err) {
        console.error('Error al eliminar asignación de mantenimiento:', err);
        next(err);
    }
};


const verAsignacionesPropias = async (req, res, next) => {
    const idOperador = req.usuario.id;

    try {
        const { rows: asignaciones } = await db.query(
            'SELECT * FROM asignacionmantenimiento WHERE usuario_id = $1',
            [idOperador]
        );

        if (asignaciones.length === 0) {
            return res.status(200).json({
                message: 'No tienes asignaciones de mantenimiento pendientes',
                data: [],
                total: 0
            });
        }

        res.status(200).json({ data: asignaciones, total: asignaciones.length });
    } catch (err) {
        console.error('Error al ver asignaciones propias:', err);
        next(err);
    }
};

const confirmarAsignacion = async (req, res, next) => {
    const idAsignacion = req.params.id;
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const { rows: asig } = await db.query('SELECT * FROM asignacionmantenimiento WHERE id = $1', [idAsignacion]);
        if (asig.length === 0) return res.status(404).json({ error: 'Asignación no encontrada' });

        const asignacion = asig[0];

        if (asignacion.usuario_id !== idUsuarioResponsable) {
            return res.status(403).json({ error: 'No puedes confirmar una asignación que no te pertenece' });
        }

        await db.query(
            `INSERT INTO mantenimiento (usuario_id, freezer_id, usuario_nombre, fecha, descripcion, tipo, observaciones)
               VALUES ($1, $2, $3, NOW(), $4, 'Correctivo', $5)`,
            [idUsuarioResponsable, asignacion.freezer_id, nombreUsuarioResponsable, 'Mantenimiento realizado', asignacion.observaciones || null]
        );

        await db.query('DELETE FROM asignacionmantenimiento WHERE id = $1', [idAsignacion]);

        const mensaje = `Operador ${nombreUsuarioResponsable} confirmó mantenimiento del freezer ID ${asignacion.freezer_id}`;
        await db.query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
               VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Mantenimiento confirmado y registrado' });
    } catch (err) {
        console.error('Error al confirmar asignación:', err);
        next(err);
    }
};

const cambiarEstadoAsignacion = async (req, res, next) => {
    const idAsignacion = req.params.id;
    const { estado } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        if (!estado) {
            return res.status(400).json({ error: 'Debe proporcionar el nuevo estado' });
        }

        const ESTADOS_VALIDOS = ['pendiente', 'en curso', 'completada', 'cancelada', 'vencida'];

        if (!ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Estados permitidos: ${ESTADOS_VALIDOS.join(', ')}` });
        }

        const { rows: asignacion } = await db.query('SELECT id, estado FROM asignacionmantenimiento WHERE id = $1', [idAsignacion]);

        if (asignacion.length === 0) {
            return res.status(404).json({ error: 'La asignación no existe' });
        }

        const oldEstado = asignacion[0].estado;

        await db.query(
            'UPDATE asignacionmantenimiento SET estado = $1 WHERE id = $2',
            [estado, idAsignacion]
        );

        const mensaje = `Se actualizó el estado de la asignación de mantenimiento ID ${idAsignacion} de "${oldEstado}" a "${estado}" por ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}).`;
        await db.query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES ($1, $2, NOW(), $3)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Estado de la asignación actualizado correctamente', newStatus: estado });

    } catch (error) {
        console.error('Error al cambiar estado de asignación:', error);
        next(error);
    }
};

const listarPendientesOperador = async (req, res, next) => {
    const idUsuarioOperador = req.usuario.id;
    const { page, pageSize, search } = req.query;

    try {
        // Actualizar el estado de asignaciones a 'vencida' si la fecha ya pasó
        const { rows: updateResult } = await db.query(
            `UPDATE asignacionmantenimiento
             SET estado = 'vencida'
             WHERE usuario_id = $1 AND estado = 'pendiente' AND fecha_asignacion < CURRENT_DATE`, // CURRENT_DATE para PostgreSQL
            [idUsuarioOperador]
        );

        let query = `
            SELECT
                am.id AS asignacion_id,
                am.fecha_asignacion,
                am.estado,
                am.tipo AS tipo_mantenimiento,
                am.observaciones AS asignacion_observaciones,
                f.id AS freezer_id,
                f.numero_serie,
                f.modelo,
                f.tipo AS tipo_freezer,
                f.capacidad,
                c.nombre_responsable AS cliente_nombre,
                c.direccion AS cliente_direccion,
                c.cuit AS cliente_cuit
            FROM asignacionmantenimiento am
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
            WHERE am.usuario_id = $1 AND am.estado IN ('pendiente', 'vencida')
        `;

        let countQuery = `
            SELECT COUNT(am.id) as total
            FROM asignacionmantenimiento am
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
            WHERE am.usuario_id = $1 AND am.estado IN ('pendiente', 'vencida')
        `;

        let params = [idUsuarioOperador];
        let countParams = [idUsuarioOperador];
        let paramIndex = 2; // El primer parámetro ($1) ya es idUsuarioOperador

        if (search) {
            const searchQueryParam = `
                AND (f.numero_serie ILIKE $${paramIndex} OR f.modelo ILIKE $${paramIndex} OR f.tipo ILIKE $${paramIndex} OR c.nombre_responsable ILIKE $${paramIndex} OR c.direccion ILIKE $${paramIndex} OR c.cuit ILIKE $${paramIndex})
            `;
            const searchPattern = `%${search}%`;
            query += searchQueryParam;
            countQuery += searchQueryParam;
            params.push(searchPattern); // Solo se necesita un push por el ILIKE
            countParams.push(searchPattern);
            paramIndex++;
        }

        query += ` ORDER BY 
            CASE am.estado
                WHEN 'pendiente' THEN 1
                WHEN 'vencida' THEN 2
                ELSE 3
            END, am.fecha_asignacion ASC`;

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);

        const { rows: mantenimientosPendientes } = await db.query(query, params);
        const { rows: totalResult } = await db.query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        if (mantenimientosPendientes.length === 0) {
            return res.status(200).json({
                message: 'No tienes mantenimientos pendientes o vencidos asignados o que coincidan con la búsqueda.',
                data: [],
                total: 0
            });
        }

        res.status(200).json({
            data: mantenimientosPendientes,
            total: totalRegistros
        });

    } catch (error) {
        console.error('Error al listar mantenimientos pendientes del operador:', error);
        next(error);
    }
};


const completarMantenimientoAsignado = async (req, res, next) => {
    const { idAsignacion } = req.params;
    const { descripcion, observaciones, tipoMantenimientoRealizado } = req.body;

    const idUsuarioOperador = req.usuario.id;
    const nombreUsuarioOperador = req.usuario.nombre;

    if (!descripcion || !tipoMantenimientoRealizado) {
        return res.status(400).json({ message: 'La descripción y el tipo de mantenimiento realizado son obligatorios.' });
    }

    try {
        const { rows: asignacionRows } = await db.query(
            `SELECT am.freezer_id, am.usuario_id, am.tipo AS tipo_asignacion, f.numero_serie
             FROM asignacionmantenimiento am
             JOIN freezer f ON am.freezer_id = f.id
             WHERE am.id = $1 AND am.usuario_id = $2 AND am.estado = 'pendiente'`,
            [idAsignacion, idUsuarioOperador]
        );

        if (asignacionRows.length === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada, no es pendiente o no te pertenece.' });
        }
        const asignacionInfo = asignacionRows[0];

        await db.query(
            `UPDATE asignacionmantenimiento
             SET estado = 'completada'
             WHERE id = $1 AND usuario_id = $2 AND estado = 'pendiente'`,
            [idAsignacion, idUsuarioOperador]
        );

        await db.query(
            `INSERT INTO mantenimiento
             (usuario_id, freezer_id, usuario_nombre, fecha, descripcion, tipo, observaciones)
             VALUES ($1, $2, $3, NOW(), $4, $5, $6)`,
            [
                idUsuarioOperador,
                asignacionInfo.freezer_id,
                nombreUsuarioOperador,
                descripcion,
                tipoMantenimientoRealizado,
                observaciones || null
            ]
        );

        await db.query(
            `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
               VALUES ($1, $2, NOW(), $3)`,
            [idUsuarioOperador, nombreUsuarioOperador, `Operador ${nombreUsuarioOperador} completó mantenimiento asignado ID ${idAsignacion} para freezer ${asignacionInfo.numero_serie}.`]
        );

        res.status(200).json({ message: 'Mantenimiento completado y registrado con éxito.' });

    } catch (err) {
        console.error('Error al completar mantenimiento asignado:', err);
        next(err);
    }
};


module.exports = {
    listar,
    crear,
    eliminar,
    verAsignacionesPropias,
    confirmarAsignacion,
    cambiarEstadoAsignacion,
    listarPendientesOperador,
    completarMantenimientoAsignado
};
