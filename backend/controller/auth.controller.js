const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Login con token
const login = async (req, res, next) => {
    // --- AÑADE ESTOS CONSOLE.LOGS ADICIONALES ---
    console.log('----------------------------------------------------');
    console.log('Intento de login recibido.');
    console.log('Contenido de req.body:', req.body); // <-- NUEVO LOG
    const { correo, password } = req.body;
    console.log('Correo extraído de body:', correo); // <-- NUEVO LOG
    console.log('Contraseña extraída de body (solo para depurar):', password); // <-- NUEVO LOG
    console.log('----------------------------------------------------');

    try {
        if (!correo || !password) {
            console.log('Error 400: Correo o contraseña faltante.');
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
        }

        console.log('Ejecutando consulta a la DB para el correo:', correo); // <-- NUEVO LOG
        const { rows: userRows } = await db.query('SELECT id, nombre, correo, contrasena, rol, activo FROM usuario WHERE correo = $1', [correo]);
        console.log('Resultado de la consulta a la DB para el usuario:', userRows);

        if (userRows.length === 0) {
            console.log('Usuario no encontrado en la DB para el correo:', correo);
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = userRows[0];
        console.log('Usuario encontrado en la DB. ID:', user.id, 'Nombre:', user.nombre, 'Correo:', user.correo);

        const passwordMatch = await bcrypt.compare(password, user.contrasena);

        console.log('Resultado de bcrypt.compare:', passwordMatch);

        if (!passwordMatch) {
            console.log('Contraseña no coincide para el usuario:', user.correo);
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        if (user.activo === false || user.activo === 0) {
            console.log('Usuario inactivo detectado:', user.correo);
            return res.status(401).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
        }

        const jwt = require('jsonwebtoken'); 
        const JWT_SECRET = process.env.JWT_SECRET; 

        if (!JWT_SECRET) {
            console.error('ERROR: JWT_SECRET no está definido en las variables de entorno!');
            return res.status(500).json({ error: 'Error de configuración del servidor (JWT_SECRET no definido).' });
        }

        const token = jwt.sign({
            id: user.id,
            correo: user.correo,
            rol: user.rol,
            nombre: user.nombre
        }, JWT_SECRET, { expiresIn: '1d' });

        console.log('Token JWT generado con éxito para:', user.correo);
        console.log('Login exitoso para usuario:', user.correo);

        res.status(200).json({
            message: 'Autenticación exitosa',
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('----------------------------------------------------');
        console.error('ERROR CRÍTICO en el controlador de login:', error);
        console.error('Mensaje de error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('----------------------------------------------------');
        next(error); 
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