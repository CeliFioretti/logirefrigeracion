const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const freezerController = require('../controller/freezer.controller.js')

// FREEZERS
// Ver todos los freezers - GET
router.get('/', verificarToken, verificarRol('Administrador'), freezerController.listar);

// Ver detalles de un freezer - GET
router.get('/:id', verificarToken, verificarRol('Administrador'), freezerController.detalle);

// Crea un freezer - POST
router.post('/', verificarToken, verificarRol('Administrador'), freezerController.crear);

// Actualizar freezer - PUT
router.put('/:id', verificarToken, verificarRol('Administrador'), freezerController.editar);

// Eliminar freezer - DELETE
router.delete('/:id', verificarToken, verificarRol('Administrador'), freezerController.eliminar);

// Asignar freezer - PUT
router.put('/:id/asignar', verificarToken, verificarRol('Administrador'), freezerController.asignarFreezer);

// Ver freezers de un cliente - GET
router.get('/cliente/:id', verificarToken, verificarRol('Administrador'), freezerController.freezersPorCliente);

// Liberar un freezer asignado - PUT
router.put('/:id/liberar', verificarToken, verificarRol('Administrador'), freezerController.liberar);



module.exports = router;