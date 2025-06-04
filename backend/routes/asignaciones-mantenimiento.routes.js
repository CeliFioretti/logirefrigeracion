const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const asignacionMantenimientoController = require('../controller/asignacion-mantenimiento.controller.js')

// ASIGNACIONES DE MANTENIMIENTOS
// Ver todas las asignaciones de mantenimiento - GET
router.get('/', verificarToken, verificarRol('Administrador'), asignacionMantenimientoController.listar);

// Crear nueva asignacion de mantenimiento - POST
router.post('/', verificarToken, verificarRol('Administrador'), asignacionMantenimientoController.crear);

// Eliminar una asignacion de mantenimiento - DELETE
router.delete('/:id', verificarToken, verificarRol('Administrador'), asignacionMantenimientoController.eliminar);

// Ver asignaciones propias (Operador) - GET
router.get('/mis-asignaciones', verificarToken, verificarRol('Operador'), asignacionMantenimientoController.verAsignacionesPropias);

// Confirmar asignación propia (Operador) - GET
router.post('/:id/confirmar', verificarToken, verificarRol('Operador'), asignacionMantenimientoController.confirmarAsignacion);


module.exports = router;