const db = require('../config/db');
const { enviarCorreo } = require('../services/emailService.js'); // Asegúrate de que esta ruta sea correcta

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
        // Importar nanoid dinámicamente
        const { nanoid } = await import('nanoid');
        const codigo = nanoid(10);

        // Calcular la expiración: fecha actual + 48 horas
        const fechaExpiracion = new Date();
        fechaExpiracion.setHours(fechaExpiracion.getHours() + 48);

        // PostgreSQL: Usar $n para los placeholders y RETURNING id para obtener el ID insertado
        const query = `INSERT INTO codigos_registro (codigo, rol, usado, fecha_creacion, fecha_expiracion) VALUES ($1, $2, 0 , NOW(), $3) RETURNING id`;
        const params = [codigo, rol, fechaExpiracion.toISOString().slice(0, 19).replace('T', ' ')];

        const result = await db.query(query, params);
        const newCodeId = result.rows[0].id; // Obtener el ID del registro recién creado

        res.status(201).json({
            message: 'Código generado exitosamente',
            codigo,
            expiracion: fechaExpiracion,
            id: newCodeId // Incluir el nuevo ID en la respuesta
        });
    } catch (err) {
        console.error('Error al crear código de registro:', err);
        next(err);
    }
};

// Lista todos los códigos de registro - GET
const listar = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 10;

        let sql = 'SELECT * FROM codigos_registro';
        let countSql = 'SELECT COUNT(*) as total FROM codigos_registro';

        const whereClauses = [];
        const queryParams = [];
        let paramIndex = 1; // Índice para los parámetros de PostgreSQL

        // En el código original no hay filtros en el `listar` principal,
        // pero si los hubiera, se agregarían aquí usando `whereClauses.push` y `queryParams.push`
        // y se incrementaría `paramIndex`.

        // Ordenamiento para PostgreSQL: códigos no usados y no expirados primero, luego los demás, ordenados por fecha de expiración.
        // La sintaxis de CASE WHEN es compatible con PostgreSQL.
        sql += ` ORDER BY CASE WHEN usado = 0 AND fecha_expiracion > NOW() THEN 0 ELSE 1 END ASC, fecha_expiracion ASC`;

        // Consulta para obtener el total de registros
        // Los parámetros para countSql son los mismos que para las whereClauses, si existen.
        // Como no hay filtros actualmente, queryParams estará vacío para el count.
        const { rows: countResult } = await db.query(countSql, queryParams);
        const totalRegistros = countResult[0].total;

        const offset = page * pageSize;
        // PostgreSQL: Usar $n para LIMIT y OFFSET
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        queryParams.push(pageSize, offset); // Los parámetros para LIMIT y OFFSET

        const { rows: filas } = await db.query(sql, queryParams);

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
const listarDisponibles = async (req, res, next) => {
    try {
        // PostgreSQL: NOW() es compatible
        const query = 'SELECT * FROM codigos_registro WHERE usado = 0 AND fecha_expiracion > NOW()';
        const { rows: filas } = await db.query(query);

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
        console.error('Error al listar códigos de registro disponibles:', err);
        next(err);
    }
};

// Elimina el código por id - DELETE
const eliminar = async (req, res, next) => {
    const { id } = req.params;

    try {
        // PostgreSQL: Usar $1 para el placeholder
        const query = 'DELETE FROM codigos_registro WHERE id = $1';
        const result = await db.query(query, [id]);

        // En PostgreSQL, el número de filas afectadas está en result.rowCount
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Código no encontrado o ya eliminado.' });
        }

        res.status(200).json({ message: 'Código eliminado' });
    } catch (err) {
        console.error('Error al eliminar código de registro:', err);
        next(err);
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
        // Esta función asume que 'enviarCorreo' es un servicio de correo que no depende del tipo de base de datos.
        // Por lo tanto, no se necesitan cambios aquí.
        await enviarCorreo({ para, asunto: subject, mensaje: message });
        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
        console.error(`Error al enviar el correo a ${para}:`, error);
        res.status(500).json({ message: 'Error al enviar el correo. Por favor, inténtelo de nuevo más tarde.' });
    }
};

module.exports = { crear, listar, listarDisponibles, eliminar, sendCodeByEmail };