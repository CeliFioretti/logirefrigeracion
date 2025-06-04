const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const eventosController = require('../controller/eventos.controller.js')

// EVENTOS FREEZER
// Ver todos los eventos de freezers - GET
router.get('/', verificarToken, verificarRol('Administrador'), eventosController.listar);

// Crear nuevo evento - POST
router.post('/', verificarToken, verificarRol('Administrador', 'Operador'), eventosController.crear);

// Ver mis eventos (Operador) - GET
router.get('/mis-eventos', verificarToken, verificarRol('Operador'), eventosController.misEventos);

module.exports = router;