const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const clientesController = require('../controller/clientes.controller.js')

// CLIENTES
// Ver todos los clientes - GET
router.get('/', verificarToken, verificarRol('Administrador'), clientesController.listar);

// Ver detalles de un cliente - GET
router.get('/:id', verificarToken, verificarRol('Administrador'), clientesController.detalle);

// Crea un cliente - POST
router.post('/', verificarToken, verificarRol('Administrador'), clientesController.crear);

// Actualizar cliente - PUT
router.put('/:id', verificarToken, verificarRol('Administrador'), clientesController.editar);

// Eliminar cliente - DELETE
router.delete('/:id', verificarToken, verificarRol('Administrador'), clientesController.eliminar);



module.exports = router;