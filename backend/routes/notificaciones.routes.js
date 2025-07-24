const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const notificacionesController = require('../controller/notificaciones.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];

// NOTIFICACIONES
// Listar notificaciones propias - GET
router.get('/', verificarToken, notificacionesController.listar);

// Marcar como leida la notificación - PUT
router.put('/:id/leida', verificarToken, notificacionesController.leida);


module.exports = router;