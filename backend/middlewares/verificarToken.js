const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const header = req.headers['authorization'];

    if (!header) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        })
    }

    const token = header.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: 'Token inválido o expirado'
            })
        }
        req.usuario = decoded;
        next();
    })
}

module.exports = verificarToken;