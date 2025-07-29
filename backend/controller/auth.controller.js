const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { enviarCorreo } = require('../services/emailService')
require('dotenv').config();

// Login con token
const login = async (req, res) => {
    const { nombre, password } = req.body;

    try {
        const [filas] = await db.promise().query('SELECT * FROM usuario WHERE nombre = ?', [nombre]);

        if (filas.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = filas[0];

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (usuario.activo === 0) {
            return res.status(403).json({ error: 'El usuario esta inactivo' });
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
        }

        const token = jwt.sign(
            payload, process.env.JWT_SECRET, { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: token,
            nombreUsuario: usuario.nombre,
            rol: usuario.rol,
            requiereCambioPassword: usuario.requiere_cambio_password === 1
        });

    } catch (error) {
        console.error(error);
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
        // Verificar si el código existe, está disponible y no ha expirado
        const [codigo] = await db.promise().query(
            `SELECT * FROM codigos_registro WHERE codigo = ? AND usado = 0 AND fecha_expiracion > NOW()`,
            [codigoRegistro]
        );

        if (codigo.length === 0) {
            return res.status(400).json({ error: 'Código inválido o expirado' });
        }

        // Verificar que el codigo sea para operador 
        // A futuro se agregaran los codigos para administradores
        const codigoEncontrado = codigo[0];

        if (codigoEncontrado.rol !== 'operador') {
            return res.status(403).json({ error: 'Este código de registro no es para operadores.' });
        }

        // Verificar si el usuario o correo existe
        const [existingUser] = await db.promise().query(`SELECT id FROM usuario WHERE nombre = ? OR correo = ?`, [nombre, correo])

        if (existingUser.length > 0) {
            const isNameTaken = existingUser.some(user => user.nombre === nombre);
            const isEmailTaken = existingUser.some(user => user.correo === correo);

            if (isNameTaken && isEmailTaken) {
                return res.status(409).json({ error: 'El nombre de usuario y el correo electrónico ya están en uso.' });
            } else if (isNameTaken) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
            } else { 
                return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
            }
        }

        // Encripto la contraseña antes de usarla
        const passwordHash = await bcrypt.hash(password, 10);

        await db.promise().query(
            `INSERT INTO usuario (nombre, correo, password, rol, activo, requiere_cambio_password) VALUES (?, ?, ?, ?, 1, 0)`,
            [nombre, correo, passwordHash, 'operador']
        );

        // Marcar el código como usado
        await db.promise().query(
            `UPDATE codigos_registro SET usado = 1 WHERE codigo = ?`,
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
        const [filas] = await db.promise().query('SELECT * FROM usuario WHERE correo = ?', [correo]);
        const usuario = filas[0];

       if (usuario) {
            const token = crypto.randomBytes(32).toString('hex');
            const expiracion = new Date(Date.now() + 3600000); // 1 hora desde ahora

            await db.promise().query(
                'UPDATE usuario SET token_recuperacion = ?, expiracion_token = ? WHERE id = ?',
                [token, expiracion, usuario.id]
            );

            // Construcción de la URL de restablecimiento para el frontend 
            const resetURL = `${process.env.CLIENT_URL}/restablecer-password?token=${token}`;

            // Enviar el correo electrónico usando el servicio de email
            await enviarCorreo({
                para: usuario.correo,
                asunto: 'Restablecer Contraseña de tu cuenta LogiRefrigeración',
                html: `
                    <p>Hola ${usuario.nombre},</p>
                    <p>Has solicitado restablecer la contraseña de tu cuenta en LogiRefrigeración.</p>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <p><a href="${resetURL}">Restablecer mi contraseña</a></p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste esto, por favor, ignora este correo.</p>
                    <p>Saludos,</p>
                    <p>El equipo de LogiRefrigeración</p>
                `,
            });
        }

        // Respuesta genérica para seguridad
        res.status(200).json({
            message: 'Si el correo electrónico está registrado, se ha enviado un enlace para restablecer la contraseña.'
        });


    } catch (error) {
        cconsole.error('Error al solicitar recuperación de contraseña:', error);
        res.status(500).json({ error: 'Error al solicitar recuperación de contraseña' });
    }
};

// Comprobar el restablecimiento de contraseña nueva
const restablecerPassword = async (req, res) => {
    const { token, nuevaPassword } = req.body;

    try {
        const [filas] = await db.promise().query(
            'SELECT * FROM usuario WHERE token_recuperacion = ?',
            [token]
        );

        const usuario = filas[0];

        if (!usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const ahora = new Date();
        if (usuario.expiracion_token < ahora) {
            return res.status(400).json({ error: 'El token ha expirado' });
        }

        const passwordHash = await bcrypt.hash(nuevaPassword, 10);

        await db.promise().query(
            `UPDATE usuario 
             SET password = ?, token_recuperacion = NULL, expiracion_token = NULL, requiere_cambio_password = 0 
             WHERE id = ?`,
            [passwordHash, usuario.id]
        );

        res.status(200).json({ message: 'Contraseña restablecida correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
};





module.exports = { login, solicitarRecuperacion, restablecerPassword, registrarUsuario };
