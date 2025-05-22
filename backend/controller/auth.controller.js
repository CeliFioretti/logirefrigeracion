const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM usuario WHERE correo = ?', [correo]);

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Correo no registrado'
            })
        }

        const usuario = rows[0];

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.password);
        if (!contraseñaValida) {
            return res.status(401).json({
                error: 'Contraseña incorrecta'
            })
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );


        res.status(200).json({ token });
    } catch (error) {
        console.error('Error real en login: ', error)
        res.status(500).json({
            error: 'Error interno al iniciar sesión'
        })
    }


}

module.exports = { login };