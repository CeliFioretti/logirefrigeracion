const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const eventosController = require('../controller/eventos.controller.js')

// EVENTOS FREEZER
// Ver todos los eventos de freezers - GET
router.get('/', verificarToken, verificarRol('Administrador'), eventosController.listar);

// Obtener usuario que realizó el evento - GET
router.get('/:id', verificarToken, verificarRol('Administrador'), eventosController.detalle);

// Crear nuevo evento - POST
router.post('/', verificarToken, verificarRol('Administrador'), eventosController.crear);

// Eliminar evento - DELETE
router.delete('/:id', verificarToken, verificarRol('Administrador'), eventosController.eliminar);


module.exports = router;