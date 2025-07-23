const db = require('../config/db.js')
const { enviarCorreo } = require('../services/emailService.js');

// DEPARTAMENTOS
// Lista todos los departamentos - GET
const listarDepartamentos = async (req, res, next) => {
    const { nombre, page, pageSize } = req.query;

    try {
        let query = 'SELECT * FROM departamento';
        let countQuery = 'SELECT COUNT(*) as total FROM departamento';

        let condiciones = [];
        let params = [];
        let countParams = [];

        if (nombre) {
            condiciones.push('nombre LIKE ?');
            params.push(`%${nombre}%`);
            countParams.push(`%${nombre}%`);
        }

        if (condiciones.length > 0) {
            const whereClause = ' WHERE ' + condiciones.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        const pageNum = parseInt(page) || 0;
        const pageSizeNum = parseInt(pageSize) || 10;
        const offset = pageNum * pageSizeNum;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSizeNum, offset);

        const [departamentos] = await db.promise().query(query, params);
        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        if (departamentos.length === 0) {
            res.status(200).json({
                message: 'No se encontraron departamentos con los criterios especificados.',
                data: []
            });
        } else {
            res.status(200).json({
                data: departamentos,
                total: totalRegistros
            });
        }

    } catch (err) {
        next(err);
    }
}

// Crea un departamento - POST
const crearDepartamento = async (req, res, next) => {
    const { nombre } = req.body

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let query = 'INSERT INTO departamento (nombre) VALUES (?)';
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        await db.promise().query(query, [nombre]);

        // Auditoría
        const mensaje = `Registro de nuevo departamento: ${nombre.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Departamento creado con éxito',
        })

    } catch (err) {
        next(err)
    }
}

// ZONAS

const verDepartamentoPorId = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [departamento] = await db.promise().query('SELECT id, nombre FROM departamento WHERE id = ?', [id]);

        if (departamento.length === 0) {
            return res.status(404).json({ message: 'Departamento no encontrado' })
        } else {
            res.status(200).json(departamento[0])
        }

    } catch (err) {
        next(err);
    }

}

// Edita departamento - PUT
const editarDepartamento = async (req, res, next) => {
    const { id } = req.params;
    const { nombre } = req.body;

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del departamento es obligatorio.' });
        }

        const [existingDept] = await db.promise().query('SELECT nombre FROM departamento WHERE id = ?', [id]);

        if (existingDept.length === 0) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        const oldNombre = existingDept[0].nombre;

        // Actualizar el nombre del departamento
        const [result] = await db.promise().query('UPDATE departamento SET nombre = ? WHERE id = ?', [nombre, id]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'No se pudo actualizar el departamento.' });
        }

        // Auditoría
        const mensaje = `Edición de departamento: ID ${id}. Nombre anterior: '${oldNombre.replace(/'/g, "")}', Nuevo nombre: '${nombre.replace(/'/g, "")}'`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Departamento actualizado correctamente',
            data: { id, nombre }
        });

    } catch (err) {
        next(err);
    }
}


// Muestra todas las zonas de un departamento - GET
const verZonasPorDepartamento = async (req, res, next) => {
    const idDepartamento = req.params.id;
    const { nombre, operador } = req.query;

    try {
        let query = `
        SELECT z.id, z.nombre AS zona, u.nombre AS operador
        FROM zona z
        LEFT JOIN usuario u ON z.usuario_id = u.id
        WHERE z.departamento_id = ?
        `;
        let params = [idDepartamento];

        if (nombre) {
            query += ' AND z.nombre LIKE ?';
            params.push(`%${nombre}%`)
        }
        if (operador) {
            query += ' AND u.nombre LIKE ?';
            params.push(`%${operador}%`)
        }

        const [results] = await db.promise().query(query, params)

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No se encontraron zonas registradas en este departamento',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }
    } catch (err) {
        next(err)
    }
}

// Ver zona - GET
const verZona = async (req, res, next) => {
    const idZona = req.params.id;
    try {
        let query = 'SELECT * FROM zona WHERE id = ?';
        const [results] = await db.promise().query(query, [idZona])

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros de la zona buscada',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }
    } catch (err) {
        next(err)
    }
}

// Crea una nueva zona - POST
const crearZona = async (req, res, next) => {
    const idDepartamento = req.params.id;
    const { nombre, idOperador } = req.body;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let query = 'INSERT INTO zona (departamento_id, usuario_id, nombre) VALUES (?, ?, ?)';

        let usuarioAsignado;

        if (idOperador === "") {
            usuarioAsignado = null;
        } else {
            usuarioAsignado = idOperador;
        }

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        await db.promise().query(query, [idDepartamento, usuarioAsignado, nombre]);

        // Auditoría
        const mensaje = `Registro de nueva zona: ${nombre.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Zona creada con éxito'
        })

        // Si existe un usuario asignado para la zona (operador), le envia un correo para informarlo.
        if (usuarioAsignado) {
            const [[operador]] = await db.promise().query('SELECT correo, nombre FROM usuario WHERE id = ?', [usuarioAsignado]);

            if (operador) {
                const asunto = '¡Nueva Zona Asignada!';
                const mensajeTexto = `Hola ${operador.nombre},\n\nSe te ha asignado una nueva zona: "${nombre}".\n\nPor favor, revisa tus tareas en la aplicación.`;
                const mensajeHtml = `
                                    <p>Hola <strong>${operador.nombre}</strong>,</p>
                                    <p>Se te ha asignado una nueva zona: <strong>"${nombre}"</strong>.</p>
                                    <p>Por favor, revisa tus tareas en la aplicación.</p>
                                    <p>Saludos cordiales,<br>El equipo de LogiRefrigeración</p>
                                `;

                enviarCorreo({
                    para: operador.correo,
                    asunto: asunto,
                    mensaje: mensajeTexto,
                    html: mensajeHtml
                }).catch(emailErr => console.error('Error enviando correo de nueva asignación:', emailErr));
            }
        }

    } catch (err) {
        next(err);
    }
}

// Editar zona - PUT
const editarZona = async (req, res, next) => {
    const idZona = req.params.id;
    const { nombre, idOperador } = req.body;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        let usuarioAAsignar = idOperador === '' ? null : idOperador;

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' })
        }

        const [existingZona] = await db.promise().query('SELECT nombre FROM zona WHERE id = ?', [idZona]);
        if (existingZona.length === 0) {
            return res.status(404).json({ message: "Zona no encontrada." });
        }
        const oldNombreZona = existingZona[0].nombre;

        let query = 'UPDATE zona SET usuario_id = ?, nombre = ?  WHERE id = ?';

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const [result] = await db.promise().query(query, [usuarioAAsignar, nombre, idZona]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Zona no encontrada o sin cambios." });
        }

        // Auditoría
        const mensaje = `Edición de zona: ID ${idZona}. Nombre de '${oldNombreZona.replace(/'/g, "")}' a '${nombre.replace(/'/g, "")}'. Operador asignado: ${usuarioAAsignar ? `ID ${usuarioAAsignar}` : 'Ninguno'}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Zona actualizada correctamente'
        })

        if (usuarioAAsignar) { // Solo envía correo si hay un operador asignado
            const [[operadorInfo]] = await db.promise().query('SELECT correo, nombre FROM usuario WHERE id = ?', [usuarioAAsignar]);

            if (operadorInfo) {
                const asunto = 'Tu Zona Ha Sido Actualizada'; 
                const mensajeTexto = `Hola ${operadorInfo.nombre},\n\nTu zona "${nombre}" ha sido modificada.\n\nPor favor, revisa los detalles en la aplicación.`;
                const mensajeHtml = `
                                    <p>Hola <strong>${operadorInfo.nombre}</strong>,</p>
                                    <p>Tu zona <strong>"${nombre}"</strong> ha sido modificada.</p>
                                    <p>Por favor, revisa los detalles en la aplicación.</p>
                                    <p>Saludos cordiales,<br>El equipo de LogiRefrigeración</p>
                                `;

                enviarCorreo({
                    para: operadorInfo.correo,
                    asunto: asunto,
                    mensaje: mensajeTexto,
                    html: mensajeHtml 
                }).catch(emailErr => console.error('Error enviando correo de actualización:', emailErr));
            }
        }

    } catch (err) {
        next(err)
    }
}

// Eliminar zona - DELETE
const eliminarZona = async (req, res, next) => {
    const idZona = req.params.id;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let querySelect = 'SELECT nombre, usuario_id FROM zona WHERE id = ?';
        let queryDelete = 'DELETE FROM zona WHERE id =?';

        const [zona] = await db.promise().query(querySelect, [idZona]);

        if (zona.length === 0) {
            return res.status(404).json({
                message: 'Zona no encontrada'
            });
        }

        const nombreZona = zona[0].nombre;
        const usuarioAsignadoId = zona[0].usuario_id;

        if (usuarioAsignadoId !== null) {
            return res.status(400).json({
                error: 'No se puede eliminar la zona porque tiene un operador asignado. Primero, desasigne el operador.'
            });
        }

        await db.promise().query(queryDelete, [idZona]);

        // Auditoría
        const mensaje = `Eliminación de zona: ${nombreZona.replace(/'/g, "")}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Zona eliminada correctamente'
        });
    } catch (err) {
        next(err);
    }
};




module.exports = {
    // Departamentos
    listarDepartamentos,
    crearDepartamento,
    editarDepartamento,
    verDepartamentoPorId,

    // Zonas
    crearZona,
    verZonasPorDepartamento,
    editarZona,
    verZona,
    eliminarZona
}