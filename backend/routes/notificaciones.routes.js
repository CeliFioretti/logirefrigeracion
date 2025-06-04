const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const notificacionesController = require('../controller/notificaciones.controller.js')

// NOTIFICACIONES
// Listar notificaciones propias - GET
router.get('/', verificarToken, verificarRol('Administrador', 'Operador'), notificacionesController.listar);

// Marcar como leida la notificación - PUT
router.put('/', verificarToken, verificarRol('Administrador'), notificacionesController.leida);


module.exports = router;