const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const asignacionMantenimientoController = require('../controller/asignacion-mantenimiento.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
const soloOperador = [verificarToken, verificarRol('operador')];
const adminYOperador = [verificarToken, verificarRol('administrador', 'operador')];

// ASIGNACIONES DE MANTENIMIENTOS
// Ver todas las asignaciones de mantenimiento - GET
router.get('/', soloAdmin, asignacionMantenimientoController.listar);

// Crear nueva asignacion de mantenimiento - POST
router.post('/', soloAdmin, asignacionMantenimientoController.crear);

// Eliminar una asignacion de mantenimiento - DELETE
router.delete('/:id', soloAdmin, asignacionMantenimientoController.eliminar);

// Actualiza el estado de una asignacion - PATCH
router.patch('/:id/estado', adminYOperador, asignacionMantenimientoController.cambiarEstadoAsignacion);

// Ver asignaciones propias (Operador) - GET
router.get('/mis-asignaciones', soloOperador, asignacionMantenimientoController.verAsignacionesPropias);

// Confirmar asignación propia (Operador) - GET
router.post('/:id/confirmar', soloOperador, asignacionMantenimientoController.confirmarAsignacion);

// Ver mantenimientos pendientes (Operador) - GET
router.get('/pendientes-operador', soloOperador, asignacionMantenimientoController.listarPendientesOperador); 

// Completar un mantenimiento asignado (Operador) - PATCH
router.patch('/:idAsignacion/completar', soloOperador, asignacionMantenimientoController.completarMantenimientoAsignado);


module.exports = router;