const db = require('../config/db.js')
const notificacionController = require('./notificaciones.controller.js');


// Obtener todos los eventos - GET
const listar = async (req, res, next) => {
  const { usuario_nombre, cliente_nombre, fechaDesde, fechaHasta, tipo, observaciones, page, pageSize } = req.query;

  try {
    let query = `
            SELECT 
                ef.*, 
                f.modelo AS modelo_freezer, 
                f.numero_serie AS numero_serie_freezer
            FROM 
                eventofreezer ef
            LEFT JOIN 
                freezer f ON ef.freezer_id = f.id
        `;
    let countQuery = 'SELECT COUNT(*) as total FROM eventofreezer';

    let condiciones = [];
    let params = [];
    let countParams = [];

    if (usuario_nombre) {
      condiciones.push('usuario_nombre LIKE ?');
      params.push(`%${usuario_nombre}%`);
      countParams.push(`%${usuario_nombre}%`);
    }
    if (cliente_nombre) {
      condiciones.push('cliente_nombre LIKE ?');
      params.push(`%${cliente_nombre}%`);
      countParams.push(`%${cliente_nombre}%`);
    }
    if (fechaDesde) {
      condiciones.push('fecha >= ?');
      params.push(`${fechaDesde} 00:00:00`);
      countParams.push(`${fechaDesde} 00:00:00`);
    }
    if (fechaHasta) {
      condiciones.push('fecha >= ?');
      params.push(`${fechaHasta} 23:59:59`);
      countParams.push(`${fechaHasta} 23:59:59`);
    }
    if (tipo) {
      condiciones.push('tipo LIKE ?');
      params.push(`%${tipo}%`);
      countParams.push(`%${tipo}%`);
    }
    if (observaciones) {
      condiciones.push('observaciones LIKE ?');
      params.push(`%${observaciones}%`);
      countParams.push(`%${observaciones}%`);
    }

    if (condiciones.length > 0) {
      const whereClause = ' WHERE ' + condiciones.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY fecha DESC'; // Mantener el orden por fecha

    const pageNum = parseInt(page) || 0;
    const pageSizeNum = parseInt(pageSize) || 10;
    const offset = pageNum * pageSizeNum;

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSizeNum, offset);

    const [eventos] = await db.promise().query(query, params);
    const [totalResult] = await db.promise().query(countQuery, countParams);
    const totalRegistros = totalResult[0].total;

    if (eventos.length === 0) {
      res.status(200).json({
        message: 'No se encontraron eventos con los criterios especificados.',
        data: []
      });
    } else {
      res.status(200).json({
        data: eventos,
        total: totalRegistros
      });
    }

  } catch (error) {
    next(error);
  }
};

// Obtener detalles de un evento por ID - GET
const detalle = async (req, res, next) => {
  const idEvento = req.params.id;

  try {
    const [results] = await db.promise().query(
      `SELECT ef.*, f.modelo AS modelo_freezer, f.numero_serie AS numero_serie_freezer, c.nombre_responsable AS nombre_cliente_responsable
             FROM eventofreezer ef
             LEFT JOIN freezer f ON ef.freezer_id = f.id
             LEFT JOIN cliente c ON ef.cliente_id = c.id
             WHERE ef.id = ?`,
      [idEvento]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado.' });
    }
    res.status(200).json({ data: results[0] });
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

    // Obtenemos el estado del freezer el cual tendrá el evento (disponible, baja, mantenimiento, asignado)
    const [resultado] = await db.promise().query('SELECT estado FROM freezer WHERE id = ?', [freezer_id]);

    if (resultado.length === 0) {
      return res.status(404).json({ error: 'Freezer no encontrado' });
    }

    const estadoActual = resultado[0].estado;

    // Si el evento a crear es entrega y el estado del freezer NO es Disponible
    if (tipoEvento === 'entrega' && estadoActual !== 'Disponible') {
      return res.status(400).json({ error: 'Solo se pueden entregar freezers disponibles' });
    }

    // Si el evento a crear es retiro y el estado del freezer NO es Asignado
    if (tipoEvento === 'retiro' && estadoActual !== 'Asignado') {
      return res.status(400).json({ error: 'Solo se pueden retirar freezers asignados' });
    }

    // Obtener nombre del cliente
    const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [cliente_id]);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Creación del evento
    await db.promise().query(`
      INSERT INTO eventofreezer 
      (usuario_id, freezer_id, usuario_nombre, cliente_id, cliente_nombre, fecha, tipo, observaciones)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [idUsuarioResponsable, freezer_id, nombreUsuarioResponsable, cliente_id, cliente.nombre_responsable, tipoEvento, observaciones || null]
    );

    // Actualizamos el estado del freezer
    let nuevoEstado;
    let nuevoClienteId;

    if (tipoEvento === 'entrega') {
      nuevoEstado = 'Asignado';
      nuevoClienteId = cliente_id; // Se asigna al cliente del evento
    } else if (tipoEvento === 'retiro') {
      nuevoEstado = 'Disponible';
      nuevoClienteId = null; // Se desasigna del cliente
    }

    // Actualizamos el estado del freezer que sufrió el evento
    await db.promise().query('UPDATE freezer SET estado = ?, cliente_id = ? WHERE id = ?', [nuevoEstado, nuevoClienteId, freezer_id]);

    // Crear notificación
    if (rolUsuarioResponsable === 'operador') {
      // Notificar a todos los administradores (simplificado como todos los usuarios con rol 'administrador')
      const [admins] = await db.promise().query('SELECT id FROM usuario WHERE rol = "administrador"');
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
    }

    // Auditoría
    const mensaje = `Registro de evento tipo ${tipoEvento.toUpperCase()} para freezer ID ${freezer_id}`;
    await db.promise().query(`
      INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) 
      VALUES (?, ?, NOW(), ?)`, [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(201).json({ message: 'Evento registrado correctamente' });

  } catch (err) {
    console.error("Error al crear evento:", err);
    next(err);
  }
};

// Editar un evento - PUT 
const editar = async (req, res, next) => {
  const idEvento = req.params.id;
  const { freezer_id, cliente_id, tipo, observaciones } = req.body;
  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  const tipoEvento = tipo?.toLowerCase();
  const tiposValidos = ['entrega', 'retiro'];

  try {
    if (!tiposValidos.includes(tipoEvento)) {
      return res.status(400).json({ error: 'Tipo de evento inválido' });
    }

    // Obtener el evento actual para verificar el estado del freezer original
    const [currentEventResult] = await db.promise().query('SELECT freezer_id, tipo FROM eventofreezer WHERE id = ?', [idEvento]);
    if (currentEventResult.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }
    const currentFreezerId = currentEventResult[0].freezer_id;
    const currentTipoEvento = currentEventResult[0].tipo;

    // Si se intenta cambiar el freezer_id o cliente_id
    if (freezer_id && Number(freezer_id) !== currentFreezerId) {
      return res.status(400).json({ error: 'No se permite cambiar el freezer asociado a un evento existente. Elimine y cree uno nuevo si es necesario.' });
    }

    // Obtenemos el nombre del cliente para la auditoría, si el cliente_id no ha cambiado
    const [[cliente]] = await db.promise().query('SELECT nombre_responsable FROM cliente WHERE id = ?', [cliente_id]);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }


    // Construir la cláusula SET dinámicamente
    let setClause = [];
    let params = [];

    if (tipoEvento && tipoEvento !== currentTipoEvento) {
      return res.status(400).json({ error: 'No se permite cambiar el tipo de evento en una edición. Cree un nuevo evento si necesita corregir el tipo.' });
    }

    if (observaciones !== undefined) {
      setClause.push('observaciones = ?');
      params.push(observaciones || null);
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No se proporcionó ningún campo válido para actualizar.' });
    }

    const query = `UPDATE eventofreezer SET ${setClause.join(', ')} WHERE id = ?`;
    params.push(idEvento);

    await db.promise().query(query, params);

    // Auditoría
    const mensajeAuditoria = `Edición del evento ID ${idEvento} (freezer: ${currentFreezerId}, tipo original: ${currentTipoEvento}) por ${nombreUsuarioResponsable} (ID ${idUsuarioResponsable}).`;
    await db.promise().query(
      'INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
      [idUsuarioResponsable, nombreUsuarioResponsable, mensajeAuditoria]
    );

    res.status(200).json({ message: 'Evento actualizado correctamente.' });

  } catch (err) {
    console.error('Error al editar el evento:', err);
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
  detalle,
  crear,
  editar,
  misEventos
}