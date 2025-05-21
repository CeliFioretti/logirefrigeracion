const db = require('../config/db.js')

// DEPARTAMENTOS
// Lista todos los departamentos - GET
const listarDepartamentos = async (req, res, next) => {
    const { nombre } = req.query;

    try {
        let query = 'SELECT * FROM departamento';
        let params = [];

        if (nombre) {
            query += ' WHERE nombre LIKE ?';
            params.push(`%${nombre}%`)
        }

        const [results] = await db.promise().query(query, params)

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay departamentos registrados aún',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }

    } catch (err) {
        next(err)
    }
}

// Crea un departamento - POST
const crearDepartamento = async (req, res, next) => {
    const { nombre } = req.body
    try {
        let query = 'INSERT INTO departamento (nombre) VALUES (?)';
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        await db.promise().query(query, [nombre]);
        res.status(201).json({
            message: 'Departamento creado con éxito'
        })
    } catch (err) {
        next(err)
    }
}

// ZONAS
// Muestra todas las zonas de un departamento - GET
const verZonasPorDepartamento = async (req, res, next) => {
    const idDepartamento = req.params.id;
    const { nombre, operador } = req.query;

    try {
        let query = `
        SELECT z.id, z.nombre AS zona, u.nombre AS operador
        FROM zona z
        INNER JOIN usuario u ON z.usuario_id = u.id
        WHERE z.departamento_id = ?
        `;
        let params = [idDepartamento];

        if (nombre) {
            query += ' AND z.nombre LIKE ?';
            params.push(`%${nombre}%`)
        }
        if (operador) {
            query += ' AND u.nombre LIKE ?';
            params.push(`%${operador}%`)
        }        

        const [results] = await db.promise().query(query, params)

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No se encontraron zonas registradas en este departamento',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }
    } catch (err) {
        next(err)
    }
}

// Ver zona - GET
const verZona = async (req, res, next) => {
    const idZona = req.params.id;
    try {
        let query = 'SELECT * FROM zona WHERE id = ?';
        const [results] = await db.promise().query(query, [idZona])

        if (results.length === 0) {
            return res.status(200).json({
                message: 'No hay registros de la zona buscada',
                data: []
            });
        } else {
            res.status(200).json({
                data: results
            });
        }
    } catch (err) {
        next(err)
    }
}

// Crea una nueva zona - POST
const crearZona = async (req, res, next) => {
    const idDepartamento = req.params.id;
    const { nombre, idUsuario } = req.body;
    try {
        let query = 'INSERT INTO zona (departamento_id, usuario_id, nombre) VALUES (?, ?, ?)';
        let usuarioAsignado;

        if (idUsuario === "") {
            usuarioAsignado = null;
        } else {
            usuarioAsignado = idUsuario;
        }

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        await db.promise().query(query, [idDepartamento, usuarioAsignado, nombre])
        res.status(201).json({
            message: 'Zona creada con éxito'
        })
    } catch (err) {
        next(err);
    }
}

// Editar zona - PUT
const editarZona = async (req, res, next) => {
    const idZona = req.params.id;
    const { nombre, idUsuario } = req.body;
    try {
        let query = 'UPDATE zona SET usuario_id = ?, nombre = ?  WHERE id = ?';
        let usuarioAsignado;

        if (idUsuario === "") {
            usuarioAsignado = null;
        } else {
            usuarioAsignado = idUsuario;
        }

        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        const [result] = await db.promise().query(query, [usuarioAsignado, nombre, idZona]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Zona no encontrada." });
        }
        res.status(200).json({
            message: 'Zona actualizada correctamente'
        })
    } catch (err) {
        next(err)
    }
}

// Eliminar zona - DELETE
const eliminarZona = async (req, res, next) => {
    const idZona = req.params.id;

    try {
        let querySelect = 'SELECT id FROM zona WHERE id = ?';
        let queryDelete = 'DELETE FROM zona WHERE id =?';

        const [exists] = await db.promise().query(querySelect, [idZona]);

        if (exists.length === 0) {
            return res.status(404).json({
                message: 'Zona no encontrada'
            })
        }

        await db.promise().query(queryDelete, [idZona])

        res.status(200).json({
            message: 'Zona eliminada correctamente'
        })
    } catch (err) {
        next(err);
    }

}





module.exports = {
    // Departamentos
    listarDepartamentos,
    crearDepartamento,

    // Zonas
    crearZona,
    verZonasPorDepartamento,
    editarZona,
    verZona,
    eliminarZona
}