const db = require('../config/db');


// Crea un nuevo código de registro para operadores - POST
const crear = async (req, res, next) => {
    const { rol } = req.body;

    if (!rol) {
        return res.status(400).json({ error: 'Rol requerido para el código de registro' });
    }

    // Validación del rol
    const rolesPermitidos = ["operador"];

    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido. Debe ser "operador".' });
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
            expiracion: fechaExpiracion
        });
    } catch (err) {
        next(err);
    }
};

// Lista todos los códigos de registro - GET
const listar = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0; 
        const pageSize = parseInt(req.query.pageSize) || 10;

        let sql = 'SELECT * FROM codigos_registro';
        const whereClauses = [];
        const queryParams = []; 

        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Ordenamiento: códigos no usados y no expirados primero, luego los demás, ordenados por fecha de expiración.
        sql += ' ORDER BY CASE WHEN usado = 0 AND fecha_expiracion > NOW() THEN 0 ELSE 1 END ASC, fecha_expiracion ASC';

        // Consulta para obtener el total de registros
        let countSql = 'SELECT COUNT(*) as total FROM codigos_registro';
        if (whereClauses.length > 0) {
            countSql += ' WHERE ' + whereClauses.join(' AND ');
        }
        // Los parámetros para countSql son los mismos que para las whereClauses, si existen.
        const [countResult] = await db.promise().query(countSql, queryParams);
        const totalRegistros = countResult[0].total;

        
        const offset = page * pageSize;
        sql += ' LIMIT ?, ?';
        
        queryParams.push(offset, pageSize); 

        const [filas] = await db.promise().query(sql, queryParams);

        if (filas.length === 0 && totalRegistros === 0) {
            return res.status(200).json({
                message: 'Aún no hay códigos de registro.',
                data: [],
                total: 0
            });
        }

        res.status(200).json({
            data: filas,
            total: totalRegistros
        });

    } catch (err) {
        console.error('Error al listar códigos de registro:', err);
        next(err);
    }
};

// Lista todos los códigos de registro DISPONIBLES - GET
const listarDisponibles = async (req, res) => {
    try {
        const [filas] = await db.promise().query(
            'SELECT * FROM codigos_registro WHERE usado = 0 AND fecha_expiracion > NOW()'
        );

        if (filas.length === 0) {
            res.status(200).json({
                message: 'Aun no hay códigos de registros',
                data: []
            })
        } else {
            res.status(200).json({
                data: filas,
                total: filas.length
            });
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

const sendCodeByEmail = async (req, res) => {
    const { para, codigo, rol } = req.body;

    if (!para || !codigo || !rol) {
        return res.status(400).json({ message: 'Se requiere la dirección de correo, el código y el rol.' });
    }

    const subject = `Tu código de registro para LogiRefrigeración como ${rol}`;
    const message = `Hola,\n\nAquí tienes tu código de registro para la aplicación LogiRefrigeración como ${rol}:\n\n${codigo}\n\nPor favor, úsalo para completar tu registro. Ten en cuenta que este código tiene una validez de 48 horas.\n\nSaludos,\nEl equipo de LogiRefrigeración`;

    try {
        await enviarCorreo({ para, asunto: subject, mensaje: message });
        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
        console.error(`Error al enviar el correo a ${para}:`, error);
        res.status(500).json({ message: 'Error al enviar el correo. Por favor, inténtelo de nuevo más tarde.' });
    }
};

module.exports = { crear, listar, listarDisponibles, eliminar};
