const db = require('../config/db.js')

// Ver todos los mantenimientos - GET
const listar = async (req, res, next) => {
    const { usuario_nombre, fechaDesde, fechaHasta, descripcion, tipo, observaciones, page, pageSize } = req.query;

    try {
        let query = 'SELECT * FROM mantenimiento';
        let countQuery = 'SELECT COUNT(*) as total FROM mantenimiento';

        let condiciones = [];
        let params = [];
        let countParams = [];

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
        if (descripcion) {
            condiciones.push('descripcion LIKE ?');
            params.push(`%${descripcion}%`);
            countParams.push(`%${descripcion}%`);
        }
        if (tipo) {
            condiciones.push('tipo LIKE ?');
            params.push(`%${tipo}%`);
            countParams.push(`%${tipo}%`);
        }
        if (observaciones) {
            condiciones.push('observaciones LIKE ?');
            params.push(`%${observaciones}%`);
            countParams.push(`%${observaciones}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
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

        if (mantenimientos.length === 0) {
            res.status(200).json({
                message: 'No se encontraron mantenimientos con los criterios especificados.',
                data: []
            });
        } else {
            res.status(200).json({
                data: mantenimientos,
                total: totalRegistros
            });
        }

    } catch (error) {
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

        const [freezer] = await db.promise().query('SELECT id FROM freezer WHERE id = ?', [freezer_id]);

        if (freezer.length === 0) {
            return res.status(404).json({ error: 'El freezer especificado no existe' });
        }

        const [duplicado] = await db.promise().query(
            'SELECT id FROM mantenimiento WHERE freezer_id = ? AND fecha = ? AND tipo = ?',
            [freezer_id, fecha, tipo]
        );

        if (duplicado.length > 0) {
            return res.status(409).json({ error: 'Ya existe un mantenimiento con esos datos' });
        }

        const query = `
      INSERT INTO mantenimiento 
      (idUsuarioResponsable, nombreUsuarioResponsable, freezer_id, fecha, descripcion, tipo, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        await db.promise().query(query, [
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
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (idUsuarioResponsable, nombreUsuarioResponsable, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(201).json({ message: 'Mantenimiento registrado correctamente' });

    } catch (err) {
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

        if (fecha) {
            setClause.push("fecha = ?");
            params.push(fecha);
        }

        if (descripcion) {
            setClause.push("descripcion = ?");
            params.push(descripcion);
        }

        if (tipo) {
            setClause.push("tipo = ?");
            params.push(tipo);
        }

        if (observaciones !== undefined) {
            setClause.push("observaciones = ?");
            params.push(observaciones || null);
        }

        const query = `UPDATE mantenimiento SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(id);

        await db.promise().query(query, params);

        // Auditoría
        const mensaje = `Se actualizó el mantenimiento ID ${id}`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (idUsuarioResponsable, nombreUsuarioResponsable, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(200).json({ message: 'Mantenimiento actualizado correctamente' });

    } catch (err) {
        next(err);
    }
};

// Ver mis mantenimientos realizados (Operador) - GET
const misMantenimientos = async (req, res, next) => {
    const idUsuarioResponsable = req.usuario.id;

    try {

        const [mantenimientos] = await db.promise().query(`SELECT * FROM mantenimiento WHERE usuario_id = ? ORDER BY fecha DESC`, [idUsuarioResponsable]);

        if (mantenimientos.length === 0) {
            return res.status(200).json({
                message: 'Aún no registraste mantenimientos',
                data: []
            });
        }

        res.status(200).json({ data: mantenimientos })

    } catch (error) {
        next(error)
    }
}




module.exports = {
    listar,
    registrar,
    actualizar,
    misMantenimientos
}