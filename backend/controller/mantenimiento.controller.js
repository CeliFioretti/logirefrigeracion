const db = require('../config/db.js')

// Ver todos los mantenimientos - GET
const listar = async (req, res, next) => {
    const { usuario_nombre, fechaDesde, fechaHasta, descripcion, tipo, observaciones, page, pageSize } = req.query;

    try {
        let query = 'SELECT m.*, f.numero_serie FROM mantenimiento m JOIN freezer f ON m.freezer_id = f.id';
        let countQuery = 'SELECT COUNT(m.id) as total FROM mantenimiento m JOIN freezer f ON m.freezer_id = f.id';

        let condiciones = [];
        let params = [];
        let countParams = [];
        let paramIndex = 1; // Para los parámetros de las condiciones

        if (usuario_nombre) {
            condiciones.push(`m.usuario_nombre ILIKE $${paramIndex++}`);
            params.push(`%${usuario_nombre}%`);
            countParams.push(`%${usuario_nombre}%`);
        }
        if (fechaDesde) {
            condiciones.push(`m.fecha >= $${paramIndex++}::timestamp`);
            params.push(`${fechaDesde} 00:00:00`);
            countParams.push(`${fechaDesde} 00:00:00`);
        }

        if (fechaHasta) {
            condiciones.push(`m.fecha <= $${paramIndex++}::timestamp`);
            params.push(`${fechaHasta} 23:59:59`);
            countParams.push(`${fechaHasta} 23:59:59`);
        }
        if (descripcion) {
            condiciones.push(`m.descripcion ILIKE $${paramIndex++}`);
            params.push(`%${descripcion}%`);
            countParams.push(`%${descripcion}%`);
        }
        if (tipo) {
            condiciones.push(`m.tipo ILIKE $${paramIndex++}`);
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }
        if (observaciones) {
            condiciones.push(`m.observaciones ILIKE $${paramIndex++}`);
            params.push(`%${observaciones}%`);
            countParams.push(`%${observaciones}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY m.fecha DESC';

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);
        // No necesitamos añadir LIMIT/OFFSET a countParams, ya que el COUNT no los usa.

        const { rows: mantenimientos } = await db.query(query, params);
        const { rows: totalResult } = await db.query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        if (mantenimientos.length === 0) {
            res.status(200).json({
                message: 'No se encontraron mantenimientos con los criterios especificados.',
                data: [],
                total: 0
            });
        } else {
            res.status(200).json({
                data: mantenimientos,
                total: totalRegistros
            });
        }

    } catch (error) {
        console.error('Error en listar mantenimientos', error)
        next(error);
    }

}

// Registrar un mantenimiento - POST
const registrar = async (req, res, next) => {
    const { freezer_id, fecha, descripcion, tipo, observaciones } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        if (!freezer_id || !fecha || !tipo || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const { rows: freezer } = await db.query('SELECT id FROM freezer WHERE id = $1', [freezer_id]);

        if (freezer.length === 0) {
            return res.status(404).json({ error: 'El freezer especificado no existe' });
        }

        const { rows: duplicado } = await db.query(
            'SELECT id FROM mantenimiento WHERE freezer_id = $1 AND fecha = $2::timestamp AND tipo = $3',
            [freezer_id, fecha, tipo]
        );

        if (duplicado.length > 0) {
            return res.status(409).json({ error: 'Ya existe un mantenimiento con esos datos' });
        }

        const query = `
            INSERT INTO mantenimiento 
            (usuario_id, usuario_nombre, freezer_id, fecha, descripcion, tipo, observaciones)
            VALUES ($1, $2, $3, $4::timestamp, $5, $6, $7)
        `;

        await db.query(query, [
            idUsuarioResponsable,
            nombreUsuarioResponsable,
            freezer_id,
            fecha,
            descripcion,
            tipo,
            observaciones || null
        ]);

        // Auditoría
        const mensaje = `Se registró mantenimiento (${tipo}) para el freezer ID ${freezer_id}`;
        await db.query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES ($1, $2, NOW(), $3)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(201).json({ message: 'Mantenimiento registrado correctamente' });

    } catch (err) {
        console.error('Error al registrar mantenimiento:', err);
        next(err);
    }
};


// Actualizar mantenimiento - PUT
const actualizar = async (req, res, next) => {
    const id = req.params.id;
    const { fecha, descripcion, tipo, observaciones } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        if (!fecha && !descripcion && !tipo && !observaciones) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
        }

        let setClause = [];
        let params = [];
        let paramIndex = 1;

        if (fecha) {
            setClause.push(`fecha = $${paramIndex++}::timestamp`);
            params.push(fecha);
        }

        if (descripcion) {
            setClause.push(`descripcion = $${paramIndex++}`);
            params.push(descripcion);
        }

        if (tipo) {
            setClause.push(`tipo = $${paramIndex++}`);
            params.push(tipo);
        }

        if (observaciones !== undefined) {
            setClause.push(`observaciones = $${paramIndex++}`);
            params.push(observaciones || null);
        }

        const query = `UPDATE mantenimiento SET ${setClause.join(', ')} WHERE id = $${paramIndex++}`;
        params.push(id);

        await db.query(query, params);

        // Auditoría
        const mensaje = `Se actualizó el mantenimiento ID ${id}`;
        await db.query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES ($1, $2, NOW(), $3)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Mantenimiento actualizado correctamente' });

    } catch (err) {
        console.error('Error al actualizar mantenimiento:', err);
        next(err);
    }
};

// Ver mis mantenimientos realizados (Operador) - GET
const misMantenimientos = async (req, res, next) => {
    const idUsuarioResponsable = req.usuario.id;

    try {

        const { rows: mantenimientos } = await db.query(`SELECT * FROM mantenimiento WHERE usuario_id = $1 ORDER BY fecha DESC`, [idUsuarioResponsable]);

        if (mantenimientos.length === 0) {
            return res.status(200).json({
                message: 'Aún no registraste mantenimientos',
                data: []
            });
        }

        res.status(200).json({ data: mantenimientos })

    } catch (error) {
        console.error('Error al obtener mis mantenimientos:', error);
        next(error)
    }
}
// Obtener un mantenimiento por ID - GET
const obtenerPorId = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows: mantenimiento } = await db.query('SELECT * FROM mantenimiento WHERE id = $1', [id]);
        if (mantenimiento.length === 0) {
            return res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
        res.status(200).json({ data: mantenimiento[0] });
    } catch (error) {
        console.error('Error al obtener mantenimiento por ID:', error);
        next(error);
    }
};


module.exports = {
    listar,
    registrar,
    actualizar,
    misMantenimientos,
    obtenerPorId
}