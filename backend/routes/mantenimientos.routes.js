const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const mantenimientoController = require('../controller/mantenimiento.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
const soloOperador = [verificarToken, verificarRol('operador')];

// MANTENIMIENTOS
// Ver todos los mantenimientos - GET
router.get('/', soloAdmin, mantenimientoController.listar);

// Registrar un mantenimiento - POST
router.post('/', verificarToken, verificarRol('administrador', 'operador'), mantenimientoController.registrar);

// Actualizar mantenimiento - PUT
router.put('/:id', soloAdmin, mantenimientoController.actualizar);

// Ver mis mantenimientos realizados (Operador) - GET
router.get('/mis-mantenimientos', soloOperador, mantenimientoController.misMantenimientos);



module.exports = router;