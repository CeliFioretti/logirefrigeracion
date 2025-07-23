const db = require('../config/db.js')
const bcrypt = require('bcrypt');


// Obtener registro completo de usuarios
const listar = async (req, res, next) => {
    const { nombre, rol } = req.query; 

    try {
        let query = 'SELECT id, nombre, correo, rol FROM usuario';
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
            condiciones.push('rol = ?');
            params.push(`${rol}`);
            countParams.push(`${rol}`);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
            countQuery += ' WHERE ' + condiciones.join(' AND ');
        }

        query += ' ORDER BY nombre ASC'; 

        const [totalResult] = await db.promise().query(countQuery, countParams);
        const totalRegistros = totalResult[0].total;

        const [resultado] = await db.promise().query(query, params);

        if (resultado.length === 0) {
            res.status(200).json({
                message: 'No hay registros de usuario actualmente',
                data: [],
                total: 0
            });
        } else {
            res.status(200).json({
                data: resultado,
                total: totalRegistros
            });
        }

    } catch (error) {
        console.error('Error en el controlador listar de usuarios (sin paginación):', error); 
        next(error); 
    }
};

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
const editarPerfil = async (req, res, next) => {
    const idUsuarioAfectado = req.usuario.id;
    const { nombre, correo } = req.body; 

    const idUsuarioResponsable = req.usuario.id;
    const nombreUsuarioResponsable = req.usuario.nombre;

    try {
        let setClause = [];
        let params = [];
        let mensajeAuditoriaPartes = [];

        // Obtener datos actuales del usuario para comparar y auditoría
        const [existingUserRows] = await db.promise().query('SELECT nombre, correo FROM usuario WHERE id = ?', [idUsuarioAfectado]);
        if (existingUserRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const oldNombre = existingUserRows[0].nombre;
        const oldCorreo = existingUserRows[0].correo;

        if (nombre !== undefined && nombre.trim() !== '' && nombre.trim() !== oldNombre) {
            setClause.push('nombre = ?');
            params.push(nombre.trim());
            mensajeAuditoriaPartes.push(`Nombre de '${oldNombre}' a '${nombre.trim()}'`);
        }

        if (correo !== undefined && correo.trim() !== '' && correo.trim() !== oldCorreo) {
            // Verificar si el nuevo correo ya está en uso por otro usuario (excluyendo al usuario actual)
            const [emailExists] = await db.promise().query(
                'SELECT id FROM usuario WHERE correo = ? AND id != ?',
                [correo.trim(), idUsuarioAfectado]
            );
            if (emailExists.length > 0) {
                return res.status(409).json({ error: 'El correo electrónico ya está en uso por otro usuario.' });
            }
            setClause.push('correo = ?');
            params.push(correo.trim());
            mensajeAuditoriaPartes.push(`Correo de '${oldCorreo}' a '${correo.trim()}'`);
        }

        if (setClause.length === 0) {
            return res.status(200).json({ message: 'No se proporcionaron cambios o los datos son idénticos.' });
        }

        const query = `UPDATE usuario SET ${setClause.join(', ')} WHERE id = ?`;
        params.push(idUsuarioAfectado);

        const [result] = await db.promise().query(query, params);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'No se pudo actualizar el perfil.' });
        }

        // Auditoría
        const mensaje = `Edición de perfil de usuario ID ${idUsuarioAfectado}: ${mensajeAuditoriaPartes.join(', ')}.`;
        await db.promise().query('INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES(?,?,NOW(),?)', [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]);

        const [updatedUser] = await db.promise().query('SELECT id, nombre, correo, rol FROM usuario WHERE id = ?', [idUsuarioAfectado]);
        res.status(200).json({
            message: 'Perfil actualizado con éxito',
            data: updatedUser[0]
        });

    } catch (err) {
        console.error('Error en editarPerfil:', err);
        next(err);
    }
};



// Actializa la contraseña del usuario - POST
const cambiarContraseña = async (req, res, next) => { 
    const { currentPassword, newPassword, confirmNewPassword } = req.body; 

    const idUsuarioResponsable = req.usuario.id; 
    const nombreUsuarioResponsable = req.usuario.nombre; 

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ error: 'Todos los campos de contraseña son obligatorios.' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'La nueva contraseña y su confirmación no coinciden.' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        // Obtener la contraseña hasheada actual del usuario de la DB
        const [userRows] = await db.promise().query('SELECT password FROM usuario WHERE id = ?', [idUsuarioResponsable]);

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado (quizás el token es inválido).' });
        }

        const hashedPassword = userRows[0].password;

        // Comparar la contraseña actual proporcionada con la hasheada en la DB
        const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Hashear la nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        await db.promise().query(
            'UPDATE usuario SET password = ?, requiere_cambio_password = 0 WHERE id = ?',
            [newPasswordHash, idUsuarioResponsable]
        );

        // Auditoría
        const mensajeAuditoria = `Contraseña del usuario ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}) cambiada.`;
        await db.promise().query(
            'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
            [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]
        );

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        next(error); 
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
        const mensajeAuditoria = `Contraseña del usuario ${nombreUsuarioAfectado} (ID ${idUsuarioAResetear}) restablecida.`;
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
    editarPerfil,
    cambiarContraseña,
    toggleEstadoUsuario,
    resetearContraseñaAdmin
}