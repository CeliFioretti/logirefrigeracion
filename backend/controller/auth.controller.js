const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Login con token
const login = async (req, res) => {
    const { nombre, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM usuario WHERE nombre_usuario = $1', [nombre]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = rows[0];

        const passwordValida = await bcrypt.compare(password, usuario.contrasena);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (usuario.estado === false) {
            return res.status(403).json({ error: 'El usuario esta inactivo' });
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre_usuario,
            rol: usuario.rol
        }

        const token = jwt.sign(
            payload, process.env.JWT_SECRET, { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            nombreUsuario: usuario.nombre_usuario,
            rol: usuario.rol,
            requiereCambioPassword: usuario.requiere_cambio_password === true
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            error: 'Error interno al iniciar sesión'
        });
    }
};

// Registra un usuario operador nuevo - POST
const registrarUsuario = async (req, res, next) => {
    const { nombre, correo, password, codigoRegistro } = req.body;

    if (!nombre || !correo || !password || !codigoRegistro) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const { rows: codigo } = await db.query(
            `SELECT * FROM codigos_registro WHERE codigo = $1 AND usado = FALSE AND fecha_expiracion > NOW()`,
            [codigoRegistro]
        );

        if (codigo.length === 0) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        const codigoEncontrado = codigo[0];

        if (codigoEncontrado.rol !== 'operador') {
            return res.status(403).json({ error: 'Este código de registro no es para operadores.' });
        }

        const { rows: existingUser } = await db.query(`SELECT id, nombre_usuario, correo FROM usuario WHERE nombre_usuario = $1 OR correo = $2`, [nombre, correo])

        if (existingUser.length > 0) {
            const isNameTaken = existingUser.some(user => user.nombre_usuario === nombre);
            const isEmailTaken = existingUser.some(user => user.correo === correo);

            if (isNameTaken && isEmailTaken) {
                return res.status(409).json({ error: 'El nombre de usuario y el correo electrónico ya están en uso.' });
            } else if (isNameTaken) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
            } else { 
                return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO usuario (nombre_usuario, correo, contrasena, rol, estado, requiere_cambio_password) VALUES ($1, $2, $3, $4, TRUE, FALSE)`,
            [nombre, correo, passwordHash, 'operador']
        );

        await db.query(
            `UPDATE codigos_registro SET usado = TRUE WHERE codigo = $1`,
            [codigoRegistro]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error('Error en registrarUsuario:', err);
        next(err);
    }
};

// El usuario solicita la recuperación de cotraseña desde el front
const solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        const usuario = rows[0];

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró un usuario con ese correo' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 3600000); // 1 hora desde ahora

        await db.query(
            'UPDATE usuario SET token_recuperacion = $1, expiracion_token = $2 WHERE id = $3',
            [token, expiracion, usuario.id]
        );

        res.status(200).json({
            message: 'Solicitud de recuperación creada',
            tokenRecuperacion: token
        });

    } catch (error) {
        console.error("Error en solicitarRecuperacion:", error);
        res.status(500).json({ error: 'Error al solicitar recuperación de contraseña' });
    }
};

// Comprobar el restablecimiento de contraseña nueva
const restablecerPassword = async (req, res) => {
    const { token, nuevaPassword } = req.body;

    try {
        const { rows } = await db.query(
            'SELECT * FROM usuario WHERE token_recuperacion = $1',
            [token]
        );

        const usuario = rows[0];

        if (!usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const ahora = new Date();
        if (usuario.expiracion_token < ahora) {
            return res.status(400).json({ error: 'El token ha expirado' });
        }

        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        await db.query(
            `UPDATE usuario 
             SET contrasena = $1, token_recuperacion = NULL, expiracion_token = NULL, requiere_cambio_password = FALSE 
             WHERE id = $2`,
            [passwordHash, usuario.id]
        );

        res.status(200).json({ message: 'Contraseña restablecida correctamente' });

    } catch (error) {
        console.error("Error en restablecerPassword:", error);
        res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
};

module.exports = { login, solicitarRecuperacion, restablecerPassword, registrarUsuario };