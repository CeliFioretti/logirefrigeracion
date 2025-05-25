const db = require('../config/db.js')
const bcrypt = require('bcrypt');


// Obtener registro completo de usuarios
const listar = async (req, res, next) => {
    const { nombre, rol } = req.query;

    try {
        let query = 'SELECT * FROM usuario';
        let condiciones = [];
        let params = [];

        if (nombre) {
            condiciones.push('nombre_responsable LIKE ?');
            params.push(`%${nombre}%`);
        }
        if (rol) {
            condiciones.push('tipo_negocio LIKE ?');
            params.push(`%${rol}%`);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
        }

        const [resultado] = await db.promise().query(query, params);

        if (resultado.length === 0) {
            res.status(200).json({
                message: 'No hay registros de usuario actualmente',
                data: []
            })
        } else {
            res.status(200).json({
                data: resultado
            })
        }

    } catch (error) {
        next(error)
    }

}

// Obtiene los detalles de un usuario
const detalle = async (req, res, next) => {
    const idUsuario = req.params.id;

    try {
        let query = 'SELECT * FROM usuario WHERE id = ?';
        const [results] = await db.promise().query(query, [idUsuario])

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros del usuario',
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

// Crea un usuario - POST
const crear = async (req, res, next) => {
    const { nombre, correo, password, rol } = req.body;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {

        let query = 'INSERT INTO usuario (nombre, correo, password, rol, activo) VALUES (?, ?, ?, ?, 0)';

        if (!nombre || nombre.trim() === '' || !correo || correo.trim() === '' || !password || password.trim() === '' || !rol || rol.trim() === '' ) {
            return res.status(400).json({ error: 'Faltan campos por rellenar' });
        } 

        const passwordHash = await bcrypt.hash(password, 10);
        
        await db.promise().query(query, [nombre, correo, passwordHash, rol]);

        // Auditoría
        const mensaje = `Se creo un nuevo usuario: ${nombre.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Usuario creado correctamente'
        })
    } catch (err) {
        next(err);
    }
}

// Editar usuario - PUT
const editar = async (req, res, next) => {

    const campos = [
        "nombre",
        "correo",
        "password"
    ]
    
    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;
    
    try {

        let setClause = [];
        let params = [];

        campos.forEach(campo => {
            if (req.body[campo] !== undefined && req.body[campo].trim() !== "") {
                setClause.push(`${campo} = ?`);
                params.push(req.body[campo]);
            }
        })

        if (setClause.length === 0) {
            return res.status(400).json({ error: 'No se proporcionó ningún campo para actualizar' });
        } 

        const query = `UPDATE usuario SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(idUsuarioResponsable);

        await db.promise().query(query, params);

        // Auditoría
        const mensaje = `Edición de usuario ID ${idUsuarioResponsable}`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        res.status(201).json({
            message: 'Actualizado con éxito'
        })
    } catch (err) {
        next(err);
    }
}

// Eliminar usuario - DELETE
const eliminar = async (req, res, next) => {
    const id = req.params.id;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let querySelect = 'SELECT * FROM usuario WHERE id = ?';
        let queryDelete = 'DELETE FROM usuario WHERE id =?';

        const [usuario] = await db.promise().query(querySelect, [id]);

        if (usuario.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            })
        }

        const nombreUsuario = usuario[0].nombre;

        await db.promise().query(queryDelete, [id])

        // Auditoría
        const mensaje = `Eliminación de usuario: ${nombreUsuario.replace(/'/g, "")}`
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable,mensaje]);

        res.status(200).json({
            message: 'Usuario eliminado correctamente'
        })
    } catch (err) {
        next(err);
    }

}


module.exports = {
    listar,
    detalle,
    crear,
    editar,
    eliminar
}