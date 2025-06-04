const db = require('../config/db.js')
const notificacionController = require('./notificaciones.controller.js');


// Obtener todos los eventos - GET
const listar = async (req, res, next) => {
  const { tipo, cliente_nombre } = req.query;

  try {

    let query = 'SELECT * FROM eventofreezer';
    let condiciones = [];
    let params = [];

    if (tipo) {
      condiciones.push('tipo LIKE ?');
      params.push(`%${tipo}%`);
    }

    if (cliente_nombre) {
      condiciones.push('cliente_nombre LIKE ?');
      params.push(`%${cliente_nombre}%`);
    }

    if (condiciones.length > 0) {
      query += ' WHERE ' + condiciones.join(' AND ');
    }

    query += ' ORDER BY fecha DESC';

    const [eventos] = await db.promise().query(query, params);

    if (eventos.length === 0) {
      return res.status(200).json({
        message: 'No hay eventos registrados con esos criterios',
        data: []
      });
    }


    res.status(200).json({ data: eventos });

  } catch (error) {
    next(error);
  }
};

// Crea un evento - POST
const crear = async (req, res, next) => {
  const { freezer_id, cliente_id, tipo, observaciones } = req.body;
  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;
  const rolUsuarioResponsable = req.usuario.rol;

  const tipoEvento = tipo?.toLowerCase();
  const tiposValidos = ['entrega', 'retiro'];

  try {
    if (!tiposValidos.includes(tipoEvento)) {
      return res.status(400).json({ error: 'Tipo de evento inválido' });
    }

    const [resultado] = await db.promise().query('SELECT estado FROM freezer WHERE id = ?', [freezer_id]);

    if (resultado.length === 0) {
      return res.status(404).json({ error: 'Freezer no encontrado' });
    }

    const estadoActual = resultado[0].estado;

    if (tipoEvento === 'entrega' && estadoActual !== 'Disponible') {
      return res.status(400).json({ error: 'Solo se pueden entregar freezers disponibles' });
    }

    if (tipoEvento === 'retiro' && estadoActual !== 'Asignado') {
      return res.status(400).json({ error: 'Solo se pueden retirar freezers asignados' });
    }

    // Obtener nombre del cliente
    const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [cliente_id]);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Crear evento
    await db.promise().query(`
      INSERT INTO eventofreezer 
      (usuario_id, freezer_id, usuario_nombre, cliente_id, cliente_nombre, fecha, tipo, observaciones)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [idUsuarioResponsable, freezer_id, nombreUsuarioResponsable, cliente_id, cliente.nombre_responsable, tipoEvento, observaciones || null]
    );

    const nuevoEstado = tipoEvento === 'entrega' ? 'Asignado' : 'Disponible';
    await db.promise().query('UPDATE freezer SET estado = ? WHERE id = ?', [nuevoEstado, freezer_id]);

    // Crear notificación
    if (rolUsuarioResponsable === 'Operador') {
      // Notificar a todos los administradores (simplificado como todos los usuarios con rol 'Administrador')
      const [admins] = await db.promise().query('SELECT id FROM usuario WHERE rol = "Administrador"');
      for (const admin of admins) {
        await notificacionController.crear({
          usuario_id: admin.id,
          titulo: `Evento de ${tipoEvento} registrado`,
          mensaje: `${nombreUsuarioResponsable} registró un ${tipoEvento} del freezer ID ${freezer_id} para el cliente ${cliente.nombre_responsable}.`,
          tipo: 'evento',
          referencia_id: freezer_id,
          referencia_tipo: 'freezer'
        });
      }
    } else if (rolUsuarioResponsable === 'Administrador') {
      // Si lo hizo el admin, notificar al operador asignado (si hay)
      const [[ultimaAsignacion]] = await db.promise().query(`
        SELECT usuario_id FROM asignacionmantenimiento 
        WHERE freezer_id = ? 
        ORDER BY fecha_creacion DESC LIMIT 1
      `, [freezer_id]);

      if (ultimaAsignacion) {
        await notificacionController.crear({
          usuario_id: ultimaAsignacion.usuario_id,
          titulo: `Evento de ${tipoEvento} asignado`,
          mensaje: `Te han asignado un evento de ${tipoEvento} para el freezer ID ${freezer_id} y el cliente ${cliente.nombre_responsable}.`,
          tipo: 'evento',
          referencia_id: freezer_id,
          referencia_tipo: 'freezer'
        });
      }
    }

    // Auditoría
    const mensaje = `Registro de evento tipo ${tipoEvento.toUpperCase()} para freezer ID ${freezer_id}`;
    await db.promise().query(`
      INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) 
      VALUES (?, ?, NOW(), ?)`, [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(201).json({ message: 'Evento registrado correctamente' });

  } catch (err) {
    next(err);
  }
};


// Obtener todos los eventos del operador logueado
const misEventos = async (req, res, next) => {
  const idUsuarioResponsable = req.usuario.id;

  try {
    const [eventos] = await db.promise().query(
      `SELECT * FROM eventofreezer WHERE usuario_id = ? ORDER BY fecha DESC`,
      [idUsuarioResponsable]
    );

    if (eventos.length === 0) {
      return res.status(200).json({
        message: 'Aún no registraste eventos',
        data: []
      });
    }

    res.status(200).json({ data: eventos });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  crear,
  misEventos
}