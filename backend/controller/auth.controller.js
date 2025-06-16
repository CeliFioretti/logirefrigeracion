const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Login con token
const login = async (req, res) => {
    const { nombre, password } = req.body;

    try {
        const [filas] = await db.promise().query('SELECT * FROM usuario WHERE nombre = ?', [nombre]);

        if (filas.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = filas[0]; 
        const rol = usuario.rol;

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (usuario.activo === 0) {
            return res.status(403).json({ error: 'El usuario esta inactivo' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            token,
            rol,
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
    const { nombre, correo, password, rol, codigoRegistro } = req.body;

    if (!nombre || !correo || !password || !rol || !codigoRegistro) {
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

        const rolesValidos = ['administrador', 'operador']
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ error: 'Rol no válido. Debe ser "administrador" u "operador".' });
        }

        // Encripto la contraseña antes de usarla
        const passwordHash = await bcrypt.hash(password, 10);

        await db.promise().query(
            `INSERT INTO usuario (nombre, correo, password, rol, activo, requiere_cambio_password) VALUES (?, ?, ?, ?, 1, 0)`,
            [nombre, correo, passwordHash, rol, codigo[0].rol]
        );

        // Marcar el código como usado
        await db.promise().query(
            `UPDATE codigos_registro SET usado = 1 WHERE codigo = ?`,
            [codigoRegistro]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        next(err);
    }
};

// El usuario solicita la recuperación de cotraseña desde el front
const solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    try {
        const [filas] = await db.promise().query('SELECT * FROM usuario WHERE correo = ?', [correo]);
        const usuario = filas[0];

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró un usuario con ese correo' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 3600000); // 1 hora desde ahora

        await db.promise().query(
            'UPDATE usuario SET token_recuperacion = ?, expiracion_token = ? WHERE id = ?',
            [token, expiracion, usuario.id]
        );

        res.status(200).json({
            message: 'Solicitud de recuperación creada',
            tokenRecuperacion: token  // El frontend lo usaría en un enlace del tipo: /recuperar?token=...
        });

    } catch (error) {
        console.error(error);
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
