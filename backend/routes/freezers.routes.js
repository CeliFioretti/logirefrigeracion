const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const freezerController = require('../controller/freezer.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
const adminYOperador = [verificarToken, verificarRol('administrador', 'operador')]; 

// FREEZERS
// Ver todos los freezers - GET
router.get('/', adminYOperador, freezerController.listar);

// Ver detalles de un freezer - GET
router.get('/:id', soloAdmin, freezerController.detalle);

// Crea un freezer - POST
router.post('/', soloAdmin, freezerController.crear);

// Actualizar freezer - PUT
router.put('/:id', soloAdmin, freezerController.editar);

// Eliminar freezer - DELETE
router.delete('/:id', soloAdmin, freezerController.eliminar);

// Asignar freezer - PUT
router.put('/:id/asignar', soloAdmin, freezerController.asignarFreezer);

// Desasignar freezer - PUT
router.patch('/:id/desasignar', soloAdmin, freezerController.desasignarFreezer);

// Ver freezers de un cliente - GET
router.get('/cliente/:id', soloAdmin, freezerController.freezersPorCliente);

// Liberar un freezer asignado - PUT
router.put('/:id/liberar', soloAdmin, freezerController.liberar);

// Obtener mantenimientos del freezer especifico - GET
router.get('/:id/mantenimientos', soloAdmin, freezerController.obtenerMantenimientosPropios)



module.exports = router;