const db = require('../config/db');


// Lista todas las notificaciones del usuario - GET
const listar = async (req, res, next) => {
    const idUsuarioResponsable = req.usuario.id;

    try {
        const { rows: notificaciones } = await db.query( 
            'SELECT * FROM notificacion WHERE usuario_id = $1 ORDER BY fecha_creacion DESC', 
            [idUsuarioResponsable]
        );

        res.status(200).json({
            data: notificaciones
        });

    } catch (error) {
        next(error);
    }
};

// Marca como leida la notificación - PUT
const leida = async (req, res, next) => {
    const id = req.params.id;
    const idUsuarioResponsable = req.usuario.id;

    try {
        await db.query( 
            'UPDATE notificacion SET leida = 1 WHERE id = $1 AND usuario_id = $2', 
        );

        res.status(200).json({ message: 'Notificación marcada como leída' });

    } catch (err) {
        next(err);
    }
};

// Crear notificación (Sirve internamente) - POST
const crear = async ({ usuario_id, titulo, mensaje, tipo, referencia_id = null, referencia_tipo = null }) => {

    try {

        await db.query( // Cambiado a db.query
            `INSERT INTO notificacion
      (usuario_id, titulo, mensaje, tipo, referencia_id, referencia_tipo)
      VALUES ($1, $2, $3, $4, $5, $6)`,
            [usuario_id, titulo, mensaje, tipo, referencia_id, referencia_tipo]
        );
    } catch (err) {
        console.error('Error al crear notificación:', err.message);
    }
};

module.exports = {
    listar,
    leida,
    crear
};