const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const [filas] = await db.promise().query('SELECT * FROM usuario WHERE correo = ?', [correo]);
        const usuario = filas[0];

        if (filas.length === 0 || !(await bcrypt.compare(contraseña, usuario.password))) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            })
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({ token });

    } catch (error) {

        res.status(500).json({
            error: 'Error interno al iniciar sesión'
        })
    }


}

module.exports = { login };