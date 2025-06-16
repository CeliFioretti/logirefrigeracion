const db = require('../config/db.js')


// Ver todos los mantenimientos - GET
const listar = async (req, res, next) => {
    const { fecha, operador, freezer, tipo } = req.query;

    try {
        let query = `SELECT * FROM mantenimiento`
        let condiciones = [];
        let params = [];

        if (fecha) {
            condiciones.push('fecha LIKE ?');
            params.push(`%${fecha}%`)
        }
        if (operador) {
            condiciones.push('usuario_nombre LIKE ?');
            params.push(`%${operador}%`)
        }
        if (freezer) {
            condiciones.push('freezer_id = ?');
            params.push(freezer)
        }
        if (tipo) {
            condiciones.push('tipo LIKE ?');
            params.push(`%${tipo}%`)
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ')
        }

        query += ' ORDER BY fecha DESC';

        const [results] = condiciones.length > 0 ? await db.promise().query(query, params) : await db.promise().query(query);

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No existen mantenimientos registrados aún',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }

    } catch (error) {
        next(error)
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