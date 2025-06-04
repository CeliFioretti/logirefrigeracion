const db = require('../config/db');
const notificacionController = require('./notificaciones.controller.js');

// Lista todas las asignaciones de mantenimiento - GET
const listar = async (req, res, next) => {
  const idUsuarioResponsable = req.usuario.id;

  try {
    let query = `SELECT * FROM asignacionmantenimiento`;
    let params = [];

    if (idUsuarioResponsable.rol === 'Operador') {
      query += ' WHERE usuario_id = ?';
      params.push(idUsuarioResponsable);
    }

    const [asignaciones] = await db.promise().query(query, params);

    res.status(200).json({
      data: asignaciones
    });
  } catch (err) {
    next(err);
  }
};


// Crear una nueva asignacion de mantenimiento - POST
const crear = async (req, res, next) => {
  const { usuario_id, freezer_id, fecha_asignacion, observaciones } = req.body;

  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  try {
    if (!usuario_id || !freezer_id || !fecha_asignacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Insertar asignación y capturar el ID generado
    const [resultado] = await db.promise().query(
      `INSERT INTO asignacionmantenimiento 
       (usuario_id, freezer_id, fecha_creacion, fecha_asignacion, estado, observaciones)
       VALUES (?, ?, NOW(), ?, 'Pendiente', ?)`,
      [usuario_id, freezer_id, fecha_asignacion, observaciones || null]
    );

    const idMantenimiento = resultado.insertId;

    // Crear notificación al operador
    await notificacionController.crear({
      usuario_id: usuario_id,  // operador asignado
      titulo: 'Nuevo mantenimiento asignado',
      mensaje: `Se te ha asignado el mantenimiento con ID ${idMantenimiento}.`,
      tipo: 'mantenimiento',
      referencia_id: idMantenimiento,
      referencia_tipo: 'mantenimiento'
    });

    // Auditoría
    const mensaje = `Asignación de mantenimiento del freezer ID ${freezer_id} al operador ID ${usuario_id}`;
    await db.promise().query(
      `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
       VALUES (?, ?, NOW(), ?)`,
      [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(201).json({ message: 'Asignación creada con éxito' });

  } catch (err) {
    next(err);
  }
};

// Eliminar una asignacion de mantenimiento - DELETE
const eliminar = async (req, res, next) => {
  const idAsignacion = req.params.id;

  // Auditoría
  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  try {
    const [asig] = await db.promise().query('SELECT * FROM asignacionmantenimiento WHERE id = ?', [idAsignacion]);

    if (asig.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    const asignacion = asig[0];

    await db.promise().query('DELETE FROM asignacionmantenimiento WHERE id = ?', [idAsignacion]);

    // Auditoría
    const mensaje = `Eliminación de asignación de mantenimiento al operador ID ${asignacion.usuario_id}, freezer ID ${asignacion.freezer_id}`;
    await db.promise().query(
      `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
       VALUES (?, ?, NOW(), ?)`,
      [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(200).json({
      message: 'Asignación eliminada correctamente'
    });
  } catch (err) {
    next(err);
  }
};


// Ver asignaciones propias (Operador) - GET
const verAsignacionesPropias = async (req, res, next) => {
  const idOperador = req.usuario.id;

  try {
    const [asignaciones] = await db.promise().query(
      'SELECT * FROM asignacionmantenimiento WHERE usuario_id = ?',
      [idOperador]
    );

    if (asignaciones.length === 0) {
      return res.status(200).json({
        message: 'No tienes asignaciones de mantenimiento pendientes',
        data: []
      });
    }

    res.status(200).json({ data: asignaciones });
  } catch (err) {
    next(err);
  }
};

// Confirmar asignacion propia (Operador) - POST
const confirmarAsignacion = async (req, res, next) => {
  const idAsignacion = req.params.id;
  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  try {

    const [asig] = await db.promise().query('SELECT * FROM asignacionmantenimiento WHERE id = ?', [idAsignacion]);
    if (asig.length === 0) return res.status(404).json({ error: 'Asignación no encontrada' });

    const asignacion = asig[0];

    if (asignacion.usuario_id !== idUsuarioResponsable) {
      return res.status(403).json({ error: 'No puedes confirmar una asignación que no te pertenece' });
    }

    await db.promise().query(
      `INSERT INTO mantenimiento (usuario_id, freezer_id, usuario_nombre, fecha, descripcion, tipo, observaciones)
       VALUES (?, ?, ?, NOW(), ?, 'Correctivo', ?)`,
      [idUsuarioResponsable, asignacion.freezer_id, nombreUsuarioResponsable, 'Mantenimiento realizado', asignacion.observaciones || null]
    );

    await db.promise().query('DELETE FROM asignacionmantenimiento WHERE id = ?', [idAsignacion]);

    // Auditoría
    const mensaje = `Operador ${nombreUsuarioResponsable} confirmó mantenimiento del freezer ID ${asignacion.freezer_id}`;
    await db.promise().query(
      `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
       VALUES (?, ?, NOW(), ?)`,
      [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(200).json({ message: 'Mantenimiento confirmado y registrado' });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  listar,
  crear,
  eliminar,
  verAsignacionesPropias,
  confirmarAsignacion

};
