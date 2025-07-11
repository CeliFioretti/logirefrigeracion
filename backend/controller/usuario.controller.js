const db = require('../config/db.js')
const bcrypt = require('bcrypt');
const { param } = require('../routes/usuario.routes.js');


// Obtener registro completo de usuarios
const listar = async (req, res, next) => {
    const { nombre, rol , page, pageSize} = req.query;

    try {
        let query = 'SELECT * FROM usuario';
        let countQuery = 'SELECT COUNT(*) as total FROM usuario';

        let condiciones = [];
        let params = [];
        let countParams = [];

        if (nombre) {
            condiciones.push('nombre LIKE ?');
            params.push(`%${nombre}%`);
            countParams.push(`%${nombre}%`);
        }
        if (rol) {
            condiciones.push('rol LIKE ?');
            params.push(`${rol}`);
            countParams.push(`${rol}`);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
            countQuery += ' WHERE ' + condiciones.join(' AND ');
        }

        query += ' ORDER BY nombre ASC'

        const limit = parseInt(pageSize);
        offset = parseInt(page) * limit;

        query += ' LIMIT ?, ?'
        params.push(offset, limit)

        const [totalResult] = await db.promise().query(countQuery, countParams)
        const totalRegistros = totalResult[0].total;

        const [resultado] = await db.promise().query(query, params);

        if (resultado.length === 0) {
            res.status(200).json({
                message: 'No hay registros de usuario actualmente',
                data: [],
                total: 0
            })
        } else {
            res.status(200).json({
                data: resultado,
                total: totalRegistros
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
        if (!nombre || nombre.trim() === '' || !correo || correo.trim() === '' || !password || password.trim() === '' || !rol || rol.trim() === '') {
            return res.status(400).json({ error: 'Faltan campos por rellenar' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        let query = `
            INSERT INTO usuario (nombre, correo, password, rol, activo, requiere_cambio_password) 
            VALUES (?, ?, ?, ?, 0, 1)
        `;

        await db.promise().query(query, [nombre, correo, passwordHash, rol]);

        // Auditoría
        const mensaje = `Se creó un nuevo usuario: ${nombre.replace(/'/g, "")}`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
        );

        res.status(201).json({
            message: 'Usuario creado correctamente'
        });
    } catch (err) {
        next(err);
    }
};


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

// Actializa la contraseña del usuario - POST
const cambiarContraseña = async (req, res) => {
    const { nuevaContraseña } = req.body;
    const idUsuarioResponsable = req.usuario.id;

    if (!nuevaContraseña || nuevaContraseña.trim() === '') {
        return res.status(400).json({ error: 'La nueva contraseña no puede estar vacía' });
    }

    try {
        const passwordHash = await bcrypt.hash(nuevaContraseña, 10);

        await db.promise().query(
            'UPDATE usuario SET password = ?, requiere_cambio_password = 0 WHERE id = ?',
            [passwordHash, idUsuarioResponsable]
        );

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
};


module.exports = {
    listar,
    detalle,
    crear,
    editar,
    eliminar,
    cambiarContraseña
}