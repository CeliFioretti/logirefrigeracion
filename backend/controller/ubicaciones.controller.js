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
        let paramIndex = 1; // Para los parámetros de las condiciones

        if (nombre) {
            condiciones.push(`nombre ILIKE $${paramIndex++}`); // Cambiado a ILIKE para PostgreSQL
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

        // Parámetros para la paginación en la query principal
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(pageSizeNum, offset);

        const { rows: departamentos } = await db.query(query, params); // Cambiado a db.query y acceso a .rows
        const { rows: totalResult } = await db.query(countQuery, countParams); // Cambiado a db.query y acceso a .rows
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
        let query = 'INSERT INTO departamento (nombre) VALUES ($1)'; // Cambiado a $1
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        await db.query(query, [nombre]); // Cambiado a db.query

        // Auditoría
        const mensaje = `Registro de nuevo departamento: ${nombre.replace(/'/g, "")}`
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1,$2,NOW(),$3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]); // Cambiado a $1, $2, $3 y NOW()

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
        const { rows: departamento } = await db.query('SELECT id, nombre FROM departamento WHERE id = $1', [id]); // Cambiado a db.query y acceso a .rows

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

        const { rows: existingDept } = await db.query('SELECT nombre FROM departamento WHERE id = $1', [id]); // Cambiado a db.query y acceso a .rows

        if (existingDept.length === 0) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        const oldNombre = existingDept[0].nombre;

        // Actualizar el nombre del departamento
        const result = await db.query('UPDATE departamento SET nombre = $1 WHERE id = $2', [nombre, id]); // Cambiado a db.query y $1, $2

        if (result.rowCount === 0) { // En pg, rowCount indica las filas afectadas
            return res.status(500).json({ error: 'No se pudo actualizar el departamento.' });
        }

        // Auditoría
        const mensaje = `Edición de departamento: ID ${id}. Nombre anterior: '${oldNombre.replace(/'/g, "")}', Nuevo nombre: '${nombre.replace(/'/g, "")}'`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1,$2,NOW(),$3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]); // Cambiado a $1, $2, $3 y NOW()

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
        WHERE z.departamento_id = $1
        `;
        let params = [idDepartamento];
        let paramIndex = 2; // Empezar en 2 porque $1 ya se usó para idDepartamento

        if (nombre) {
            query += ` AND z.nombre ILIKE $${paramIndex++}`; // Cambiado a ILIKE
            params.push(`%${nombre}%`)
        }
        if (operador) {
            query += ` AND u.nombre ILIKE $${paramIndex++}`; // Cambiado a ILIKE
            params.push(`%${operador}%`)
        }

        const { rows: results } = await db.query(query, params) // Cambiado a db.query y acceso a .rows

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
        let query = 'SELECT * FROM zona WHERE id = $1'; // Cambiado a $1
        const { rows: results } = await db.query(query, [idZona]) // Cambiado a db.query y acceso a .rows

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros de la zona buscada',
                data: []
            });
        } else {
            res.status(200).json({
                data: results[0] // Devolver el primer elemento ya que es por ID
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
        let query = 'INSERT INTO zona (departamento_id, usuario_id, nombre) VALUES ($1, $2, $3)'; // Cambiado a $1, $2, $3

        let usuarioAsignado;

        if (idOperador === "") {
            usuarioAsignado = null;
        } else {
            usuarioAsignado = idOperador;
        }

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        await db.query(query, [idDepartamento, usuarioAsignado, nombre]); // Cambiado a db.query

        // Auditoría
        const mensaje = `Registro de nueva zona: ${nombre.replace(/'/g, "")}`
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1,$2,NOW(),$3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]); // Cambiado a $1, $2, $3 y NOW()

        res.status(201).json({
            message: 'Zona creada con éxito'
        })

        // Si existe un usuario asignado para la zona (operador), le envia un correo para informarlo.
        if (usuarioAsignado) {
            const { rows: [operador] } = await db.query('SELECT correo, nombre FROM usuario WHERE id = $1', [usuarioAsignado]); // Cambiado a db.query y acceso a .rows

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

        const { rows: existingZona } = await db.query('SELECT nombre FROM zona WHERE id = $1', [idZona]); // Cambiado a db.query y acceso a .rows
        if (existingZona.length === 0) {
            return res.status(404).json({ message: "Zona no encontrada." });
        }
        const oldNombreZona = existingZona[0].nombre;

        let query = 'UPDATE zona SET usuario_id = $1, nombre = $2 WHERE id = $3'; // Cambiado a $1, $2, $3

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const result = await db.query(query, [usuarioAAsignar, nombre, idZona]); // Cambiado a db.query

        if (result.rowCount === 0) { // En pg, rowCount indica las filas afectadas
            return res.status(404).json({ message: "Zona no encontrada o sin cambios." });
        }

        // Auditoría
        const mensaje = `Edición de zona: ID ${idZona}. Nombre de '${oldNombreZona.replace(/'/g, "")}' a '${nombre.replace(/'/g, "")}'. Operador asignado: ${usuarioAAsignar ? `ID ${usuarioAAsignar}` : 'Ninguno'}`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1,$2,NOW(),$3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]); // Cambiado a $1, $2, $3 y NOW()

        res.status(200).json({
            message: 'Zona actualizada correctamente'
        })

        if (usuarioAAsignar) { // Solo envía correo si hay un operador asignado
            const { rows: [operadorInfo] } = await db.query('SELECT correo, nombre FROM usuario WHERE id = $1', [usuarioAAsignar]); // Cambiado a db.query y acceso a .rows

            if (operadorInfo) {
                const asunto = 'Tu Zona Ha Sido Actualizada';
                const mensajeTexto = `Hola ${operadorInfo.nombre},\n\nTu zona "${nombre}" ha sido modificada.\n\nPor favor, revisa los detalles en la aplicación.`;
                const mensajeHtml = `
                                        <p>Hola <strong>${operadorInfo.nombre}</strong>,</p>
                                        <p>Se te asignó una nueva zona: <strong>"${nombre}"</strong> .</p>
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
        let querySelect = 'SELECT nombre, usuario_id FROM zona WHERE id = $1'; // Cambiado a $1
        let queryDelete = 'DELETE FROM zona WHERE id = $1'; // Cambiado a $1

        const { rows: zona } = await db.query(querySelect, [idZona]); // Cambiado a db.query y acceso a .rows

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

        await db.query(queryDelete, [idZona]); // Cambiado a db.query

        // Auditoría
        const mensaje = `Eliminación de zona: ${nombreZona.replace(/'/g, "")}`;
        await db.query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES($1,$2,NOW(),$3)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]); // Cambiado a $1, $2, $3 y NOW()

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