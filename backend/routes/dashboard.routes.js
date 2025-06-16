const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const notificacionesController = require('../controller/dashboard.controller.js')

// DASHBOARD
// Mostrar Dashboard
router.get('/', verificarToken, verificarRol('administrador', 'operador'), notificacionesController.mostrar);

module.exports = router;