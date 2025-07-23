const db = require('../config/db.js')
const bcrypt = require('bcrypt');


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

// Funcion para dar de baja o alta un usuario
const toggleEstadoUsuario = async (req, res, next) => {
    const idUsuario = req.params.id; // El ID del usuario a modificar

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        const [userResults] = await db.promise().query('SELECT activo FROM usuario WHERE id = ?', [idUsuario]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const currentStatus = userResults[0].activo;
        const newStatus = currentStatus === 1 ? 0 : 1; 

        await db.promise().query('UPDATE usuario SET activo = ? WHERE id = ?', [newStatus, idUsuario]);

        const accion = newStatus === 1 ? 'activado' : 'inhabilitado';
        const mensajeAuditoria = `Usuario ID ${idUsuario} ha sido ${accion} por ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}).`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]
        );

        res.status(200).json({ message: `Usuario ${idUsuario} ha sido ${accion} exitosamente.`, newStatus: newStatus });

    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        next(error); 
    }
};

// Para que el administrador pueda resetear la contraseña de los operadores
const resetearContraseñaAdmin = async (req, res, next) => {
    const idUsuarioAResetear = req.params.id; 
    const { nuevaContraseña } = req.body;

    // Auditoría
    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    if (!nuevaContraseña || nuevaContraseña.trim() === '') {
        return res.status(400).json({ error: 'La nueva contraseña no puede estar vacía.' });
    }

    if (nuevaContraseña.length < 8) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        // Verificar si el usuario existe
        const [userExists] = await db.promise().query('SELECT id, nombre FROM usuario WHERE id = ?', [idUsuarioAResetear]);
        if (userExists.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const nombreUsuarioAfectado = userExists[0].nombre;

        // Hashear la nueva contraseña
        const passwordHash = await bcrypt.hash(nuevaContraseña, 10);

        // Actualizar la contraseña en la base de datos
        await db.promise().query(
            'UPDATE usuario SET password = ?, requiere_cambio_password = 0 WHERE id = ?',
            [passwordHash, idUsuarioAResetear]
        );

        // Registrar en la auditoría
        const mensajeAuditoria = `Contraseña del usuario ${nombreUsuarioAfectado} (ID ${idUsuarioAResetear}) restablecida por el administrador ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}).`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]
        );

        res.status(200).json({ message: `Contraseña del usuario "${nombreUsuarioAfectado}" restablecida correctamente.` });

    } catch (error) {
        console.error('Error al restablecer la contraseña del usuario:', error);
        next(error); 
    }
};

module.exports = {
    listar,
    detalle,
    editar,
    cambiarContraseña,
    toggleEstadoUsuario,
    resetearContraseñaAdmin
}