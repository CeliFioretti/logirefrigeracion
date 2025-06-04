const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const mantenimientoController = require('../controller/mantenimiento.controller.js')

// MANTENIMIENTOS
// Ver todos los mantenimientos - GET
router.get('/', verificarToken, verificarRol('Administrador'), mantenimientoController.listar);

// Registrar un mantenimiento - POST
router.post('/', verificarToken, verificarRol('Administrador', 'Operador'), mantenimientoController.registrar);

// Actualizar mantenimiento - PUT
router.put('/:id', verificarToken, verificarRol('Administrador'), mantenimientoController.actualizar);

// Ver mis mantenimientos realizados (Operador) - GET
router.get('/mis-mantenimientos', verificarToken, verificarRol('Operador'), mantenimientoController.misMantenimientos);



module.exports = router;