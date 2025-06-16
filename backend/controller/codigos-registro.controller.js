const db = require('../config/db');


// Crea un nuevo código de registro para operadores - POST
const crear = async (req, res, next) => {
    const { rol} = req.body;

    if (!rol) {
        return res.status(400).json({ error: 'Rol requerido' });
    }

    // Validación del rol
    const rolesPermitidos = ["administrador", "operador"];

    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido. Debe ser "administrador" u "operador".' });
    }

    try {
        const { nanoid } = await import('nanoid');
        const codigo = nanoid(10);

        // Calcular la expiración: fecha actual + 48 horas
        const fechaExpiracion = new Date();
        fechaExpiracion.setHours(fechaExpiracion.getHours() + 48);

        await db.promise().query(
            `INSERT INTO codigos_registro (codigo, rol, usado, fecha_creacion, fecha_expiracion) VALUES (?, ?, 0 , NOW(), ?)`,
            [codigo, rol, fechaExpiracion.toISOString().slice(0, 19).replace('T', ' ')]
        );

        res.status(201).json({ 
            message: 'Código generado exitosamente', 
            codigo, 
            expiracion: fechaExpiracion  });
    } catch (err) {
        next(err);
    }
};

// Lista todos los códigos de registro - GET
const listar = async (req, res) => {
    try {
        const [filas] = await db.promise().query('SELECT * FROM codigos_registro');

        if (filas.length === 0) {
            res.status(200).json({
                message: 'Aun no hay códigos de registros',
                data: []
            })
        } else{
            res.status(200).json(filas);
        }
    } catch (err) {
        next(err)
    }
};


// Lista todos los códigos de registro DISPONIBLES - GET
const listarDisponibles = async (req, res) => {
    try {
        const [filas] = await db.promise().query(
            'SELECT * FROM codigos_registro WHERE usado = 0 AND expiracion > NOW()'
        );

        if (filas.length === 0) {
            res.status(200).json({
                message: 'Aun no hay códigos de registros',
                data: []
            })
        } else{
            res.status(200).json(filas);
        }

    } catch (err) {
        next(err)
    }
};

// Elimina el código por id - DELETE
const eliminar = async (req, res) => {
    const { id } = req.params;

    try {
        await db.promise().query('DELETE FROM codigos_registro WHERE id = ?', [id]);
        res.status(200).json({ message: 'Código eliminado' });
    } catch (err) {
        next(err)
    }
};

module.exports = { crear, listar, listarDisponibles, eliminar };
