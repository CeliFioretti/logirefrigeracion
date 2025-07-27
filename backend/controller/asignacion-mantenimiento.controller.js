const db = require('../config/db');
const notificacionController = require('./notificaciones.controller.js');

// Lista todas las asignaciones de mantenimiento - GET
const listar = async (req, res, next) => {
  const { page, pageSize, usuario_nombre, freezer_numero_serie, estado, fechaDesde, fechaHasta } = req.query;

  try {
    let query = `
            SELECT
                am.id AS asignacion_id,
                am.fecha_creacion,
                am.fecha_asignacion,
                am.estado,
                am.tipo AS tipo_asignacion,
                am.observaciones AS asignacion_observaciones,
                u.id AS usuario_id,
                u.nombre AS usuario_nombre,
                u.correo AS usuario_correo,
                f.id AS freezer_id,
                f.numero_serie,
                f.modelo,
                f.tipo AS tipo_freezer,
                f.capacidad,
                c.nombre_responsable AS cliente_nombre
            FROM asignacionmantenimiento am
            JOIN usuario u ON am.usuario_id = u.id
            JOIN freezer f ON am.freezer_id = f.id
            LEFT JOIN cliente c ON f.cliente_id = c.id
        `;
    let countQuery = `
            SELECT COUNT(am.id) as total
            FROM asignacionmantenimiento am
            JOIN usuario u ON am.usuario_id = u.id
            JOIN freezer f ON am.freezer_id = f.id
            LEFT JOIN cliente c ON f.cliente_id = c.id
        `;

    let condiciones = [];
    let params = [];
    let countParams = [];

    if (usuario_nombre) {
      condiciones.push('u.nombre LIKE ?');
      params.push(`%${usuario_nombre}%`);
      countParams.push(`%${usuario_nombre}%`);
    }
    if (freezer_numero_serie) {
      condiciones.push('f.numero_serie LIKE ?');
      params.push(`%${freezer_numero_serie}%`);
      countParams.push(`%${freezer_numero_serie}%`);
    }

    if (estado && estado !== '') {
      condiciones.push(`am.estado = $${paramIndex++}`);
      queryParams.push(estado);
    }

    if (fechaDesde) {
      condiciones.push('am.fecha_asignacion >= ?');
      params.push(fechaDesde);
      countParams.push(fechaDesde);
    }
    if (fechaHasta) {
      condiciones.push('am.fecha_asignacion <= ?');
      params.push(fechaHasta);
      countParams.push(fechaHasta);
    }

    if (condiciones.length > 0) {
      query += ' WHERE ' + condiciones.join(' AND ');
      countQuery += ' WHERE ' + condiciones.join(' AND ');
    }

    query += ' ORDER BY am.fecha_asignacion DESC'; // Ordenar por fecha de asignación

    const [totalResult] = await db.promise().query(countQuery, countParams);
    const totalRegistros = totalResult[0].total;

    const pageNum = parseInt(page) || 0;
    const pageSizeNum = parseInt(pageSize) || 10;
    const offset = pageNum * pageSizeNum;

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSizeNum, offset);

    const [asignaciones] = await db.promise().query(query, params);

    if (asignaciones.length === 0 && totalRegistros === 0) {
      return res.status(200).json({
        message: 'No hay asignaciones de mantenimiento registradas.',
        data: [],
        total: 0
      });
    }

    res.status(200).json({
      data: asignaciones,
      total: totalRegistros
    });

  } catch (err) {
    console.error('Error al listar asignaciones de mantenimiento:', err);
    next(err);
  }
};

const crear = async (req, res, next) => {
  const { usuario_id, freezer_id, fecha_asignacion, observaciones, tipo_mantenimiento_asignado } = req.body;

  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  try {
    if (!usuario_id || !freezer_id || !fecha_asignacion || !tipo_mantenimiento_asignado) {
      return res.status(400).json({ error: 'Faltan datos requeridos: usuario_id, freezer_id, fecha_asignacion, tipo_mantenimiento_asignado.' });
    }

    // Insertar asignación y capturar el ID generado
    const [resultado] = await db.promise().query(
      `INSERT INTO asignacionmantenimiento
               (usuario_id, freezer_id, fecha_creacion, fecha_asignacion, estado, observaciones, tipo)
               VALUES (?, ?, NOW(), ?, 'pendiente', ?, ?)`,
      [usuario_id, freezer_id, fecha_asignacion, observaciones || null, tipo_mantenimiento_asignado]
    );

    const idAsignacion = resultado.insertId;

    // Obtener nombre del operador para la notificación
    const [operadorInfo] = await db.promise().query('SELECT nombre FROM usuario WHERE id = ?', [usuario_id]);
    const nombreOperador = operadorInfo[0]?.nombre || 'Operador Desconocido';

    // Obtener número de serie del freezer para la notificación
    const [freezerInfo] = await db.promise().query('SELECT numero_serie FROM freezer WHERE id = ?', [freezer_id]);
    const numeroSerieFreezer = freezerInfo[0]?.numero_serie || 'Freezer Desconocido';


    // Crear notificación al operador
    await notificacionController.crear({
      usuario_id: usuario_id,  // operador asignado
      titulo: 'Nueva Asignación de Mantenimiento',
      mensaje: `Se te ha asignado un mantenimiento para el freezer ${numeroSerieFreezer} (ID: ${freezer_id}) con fecha ${new Date(fecha_asignacion).toLocaleDateString()}.`,
      tipo: 'asignacion_mantenimiento',
      referencia_id: idAsignacion,
      referencia_tipo: 'asignacion_mantenimiento'
    });

    // Auditoría
    const mensaje = `Asignación de mantenimiento (ID: ${idAsignacion}) del freezer ${numeroSerieFreezer} (ID: ${freezer_id}) al operador ${nombreOperador} (ID: ${usuario_id}). Tipo: ${tipo_mantenimiento_asignado}.`;
    await db.promise().query(
      `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
               VALUES (?, ?, NOW(), ?)`,
      [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(201).json({ message: 'Asignación creada con éxito', id: idAsignacion });

  } catch (err) {
    console.error('Error al crear asignación de mantenimiento:', err);
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

// Actualiza el estado de una asignacion de mantenimiento.
const cambiarEstadoAsignacion = async (req, res, next) => {
  const idAsignacion = req.params.id;
  const { estado } = req.body;

  const idUsuarioResponsable = req.usuario.id;
  const nombreUsuarioResponsable = req.usuario.nombre;

  try {
    if (!estado) {
      return res.status(400).json({ error: 'Debe proporcionar el nuevo estado' });
    }

    const ESTADOS_VALIDOS = ['pendiente', 'en curso', 'completado', 'cancelado', 'vencida'];

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Estados permitidos: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const [asignacion] = await db.promise().query('SELECT id FROM asignacionmantenimiento WHERE id = ?', [idAsignacion]);

    if (asignacion.length === 0) {
      return res.status(404).json({ error: 'La asignación no existe' });
    }

    await db.promise().query(
      'UPDATE asignacionmantenimiento SET estado = ? WHERE id = ?',
      [estado, idAsignacion]
    );

    // Auditoría
    const mensaje = `Se actualizó el estado de la asignación de mantenimiento ID ${idAsignacion} a "${estado}"`;
    await db.promise().query(
      'INSERT INTO auditoriadeactividades (idUsuarioResponsable, nombreUsuarioResponsable, fecha_hora, accion) VALUES (?, ?, NOW(), ?)',
      [idUsuarioResponsable, nombreUsuarioResponsable, mensaje]
    );

    res.status(200).json({ message: 'Estado de la asignación actualizado correctamente' });

  } catch (error) {
    next(error);
  }
};

// Mantenimientos pendientes de operador - GET
const listarPendientesOperador = async (req, res, next) => {
  const idUsuarioOperador = req.usuario.id;
  const { page, pageSize, search } = req.query;

  try {

    // Construir la consulta SELECT para obtener las asignaciones pendientes y vencidas
    let query = `
            SELECT
                am.id AS asignacion_id,
                am.fecha_asignacion,
                am.estado,
                am.tipo AS tipo_mantenimiento,
                am.observaciones AS asignacion_observaciones,
                f.id AS freezer_id,
                f.numero_serie,
                f.modelo,
                f.tipo AS tipo_freezer,
                f.capacidad,
                c.nombre_responsable AS nombre_cliente,
                c.direccion AS cliente_direccion,
                c.cuit AS cliente_cuit
            FROM asignacionmantenimiento am
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
            WHERE am.usuario_id = ? 
        `;

    let countQuery = `
            SELECT COUNT(am.id) as total
            FROM asignacionmantenimiento am
            JOIN freezer f ON am.freezer_id = f.id
            JOIN cliente c ON f.cliente_id = c.id
            WHERE am.usuario_id = ? 
        `;

    let params = [idUsuarioOperador];
    let countParams = [idUsuarioOperador];

    if (search) {
      const searchQueryParam = `
                AND (f.numero_serie LIKE ? OR f.modelo LIKE ? OR f.tipo LIKE ? OR c.nombre_responsable LIKE ? OR c.direccion LIKE ? OR c.cuit LIKE ?)
            `;
      const searchPattern = `%${search}%`;
      query += searchQueryParam;
      countQuery += searchQueryParam;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY FIELD(am.estado, 'pendiente', 'vencida'), am.fecha_asignacion ASC`;

    const pageNum = parseInt(page) || 0;
    const pageSizeNum = parseInt(pageSize) || 10;
    const offset = pageNum * pageSizeNum;

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSizeNum, offset);

    const [mantenimientosPendientes] = await db.promise().query(query, params);
    const [totalResult] = await db.promise().query(countQuery, countParams);
    const totalRegistros = totalResult[0].total;

    console.log(`[listarPendientesOperador] Query de selección ejecutada. Resultados:`, mantenimientosPendientes);
    console.log(`[listarPendientesOperador] Total de registros encontrados:`, totalRegistros);


    if (mantenimientosPendientes.length === 0) {
      return res.status(200).json({
        message: 'No tienes mantenimientos pendientes o vencidos asignados o que coincidan con la búsqueda.',
        data: [],
        total: 0
      });
    }

    res.status(200).json({
      data: mantenimientosPendientes,
      total: totalRegistros
    });

  } catch (error) {
    console.error('Error al listar mantenimientos pendientes del operador:', error);
    next(error);
  }
};


// Completar un mantenimiento asignado - PATCH
const completarMantenimientoAsignado = async (req, res, next) => {
  const { idAsignacion } = req.params;
  const { descripcion, observaciones, tipoMantenimientoRealizado } = req.body; // Datos que envía el operador

  const idUsuarioOperador = req.usuario.id;
  const nombreUsuarioOperador = req.usuario.nombre;

  if (!descripcion || !tipoMantenimientoRealizado) {
    return res.status(400).json({ message: 'La descripción y el tipo de mantenimiento realizado son obligatorios.' });
  }

  try {
    // Obtener detalles de la asignación para el registro de mantenimiento
    const [asignacionRows] = await db.promise().query(
      `SELECT am.freezer_id, am.usuario_id, am.tipo AS tipo_asignacion, f.numero_serie
             FROM asignacionmantenimiento am
             JOIN freezer f ON am.freezer_id = f.id
             WHERE am.id = ? AND am.usuario_id = ? AND am.estado = 'pendiente'`,
      [idAsignacion, idUsuarioOperador]
    );

    if (asignacionRows.length === 0) {
      return res.status(404).json({ message: 'Asignación no encontrada, no es pendiente o no te pertenece.' });
    }
    const asignacionInfo = asignacionRows[0];

    // Actualizar el estado de la asignación a 'completada'
    await db.promise().query(
      `UPDATE asignacionmantenimiento 
             SET estado = 'completada' 
             WHERE id = ? AND usuario_id = ? AND estado = 'pendiente'`,
      [idAsignacion, idUsuarioOperador]
    );

    // Crear un nuevo registro en la tabla `mantenimiento`
    await db.promise().query(
      `INSERT INTO mantenimiento 
             (usuario_id, freezer_id, usuario_nombre, fecha, descripcion, tipo, observaciones)
             VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [
        idUsuarioOperador,
        asignacionInfo.freezer_id,
        nombreUsuarioOperador,
        descripcion,
        tipoMantenimientoRealizado,
        observaciones || null
      ]
    );

    // Auditoría
    await db.promise().query(
      `INSERT INTO auditoriadeactividades (usuario_id, usuario_nombre, fecha_hora, accion)
             VALUES (?, ?, NOW(), ?)`,
      [idUsuarioOperador, nombreUsuarioOperador, `Operador ${nombreUsuarioOperador} completó mantenimiento asignado ID ${idAsignacion} para freezer ${asignacionInfo.numero_serie}.`]
    );

    res.status(200).json({ message: 'Mantenimiento completado y registrado con éxito.' });

  } catch (err) {
    console.error('Error al completar mantenimiento asignado:', err);
    next(err); // Pasa el error al manejador de errores global
  }
};


module.exports = {
  listar,
  crear,
  eliminar,
  verAsignacionesPropias,
  confirmarAsignacion,
  cambiarEstadoAsignacion,
  listarPendientesOperador,
  completarMantenimientoAsignado
};
