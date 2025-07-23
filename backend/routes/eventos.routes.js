const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const eventosController = require('../controller/eventos.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
const soloOperador = [verificarToken, verificarRol('operador')];

// EVENTOS FREEZER
// Ver todos los eventos de freezers - GET
router.get('/', soloAdmin, eventosController.listar);

// Ver detalles de un evento por ID - GET
router.get('/:id', soloAdmin, eventosController.detalle);

// Crear nuevo evento - POST
router.post('/', verificarToken, verificarRol('administrador', 'operador'), eventosController.crear);

// Editar evento por ID - PUT
router.put('/:id', soloAdmin, eventosController.editar); 

// Ver mis eventos (Operador) - GET
router.get('/mis-eventos', soloOperador, eventosController.misEventos);

module.exports = router;