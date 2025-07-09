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
            return res.status(404).json({ message: 'Departamento no encontrado'})
        } else{
            res.status(200).json(departamento[0])
        }

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
        INNER JOIN usuario u ON z.usuario_id = u.id
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
            const [[operador]] = await db.promise().query('SELECT email, nombre FROM usuario WHERE id = ?', [usuarioAsignado]);

            if (operador) {
                await enviarCorreo({
                    para: operador.email,
                    asunto: 'Zona asignada',
                    mensaje: `Hola ${operador.nombre}, se te ha asignado una nueva zona: "${nombre}".`
                });
            }
        }

    } catch (err) {
        next(err);
    }
}

// Editar zona - PUT
const editarZona = async (req, res, next) => {
    const idZona = req.params.id;
    const { nombre } = req.body;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let query = 'UPDATE zona SET usuario_id = ?, nombre = ?  WHERE id = ?';

        let usuarioAsignado = idUsuarioResponsable;

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const [result] = await db.promise().query(query, [usuarioAsignado, nombre, idZona]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Zona no encontrada." });
        }

        // Auditoría
        const mensaje = `Edición de zona: ${nombre.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Zona actualizada correctamente'
        })

        const [[operador]] = await db.promise().query('SELECT email, nombre FROM usuario WHERE id = ?', [usuarioAsignado]);

        if (operador) {
            await enviarCorreo({
                para: operador.email,
                asunto: 'Zona actualizada',
                mensaje: `Hola ${operador.nombre}, tu zona fue modificada. Nueva Zona: "${nombre}".`
            });
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
        let querySelect = 'SELECT * FROM zona WHERE id = ?';
        let queryDelete = 'DELETE FROM zona WHERE id =?';

        const [zona] = await db.promise().query(querySelect, [idZona]);

        if (zona.length === 0) {
            return res.status(404).json({
                message: 'Zona no encontrada'
            })
        }

        const nombreZona = zona[0].nombre;

        await db.promise().query(queryDelete, [idZona])

        // Auditoría
        const mensaje = `Eliminación de zona: ${nombreZona.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(200).json({
            message: 'Zona eliminada correctamente'
        })
    } catch (err) {
        next(err);
    }

}





module.exports = {
    // Departamentos
    listarDepartamentos,
    crearDepartamento,
    verDepartamentoPorId,

    // Zonas
    crearZona,
    verZonasPorDepartamento,
    editarZona,
    verZona,
    eliminarZona
}