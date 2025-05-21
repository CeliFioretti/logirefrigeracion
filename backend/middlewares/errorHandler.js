module.exports = (err, req, res, next) => {
  console.log('🛠️ ERROR DETECTADO:', err); 
  const isDev = process.env.NODE_ENV === 'development';

  switch (err.errno) {
    case 1451: // Restricción de eliminación por FK
      return res.status(409).json({ error: 'No se puede eliminar: está en uso' });

    case 1062: // Valor único
      return res.status(409).json({ error: 'Ya existe un registro con ese valor' });

    case 1048: // NULL en campo requerido
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    case 1366: // Tipo de dato inválido
      return res.status(400).json({ error: 'Tipo de dato inválido para uno o más campos' });

    case 1452: // FK inválida
      return res.status(409).json({ error: 'Referencia a un registro inexistente' });

    default:
      return res.status(500).json({
        error: 'Error inesperado en el servidor.',
        detalle: isDev ? err.message : undefined
      });
  }
};
