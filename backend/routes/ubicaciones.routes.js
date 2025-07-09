const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const ubicacionController = require('../controller/ubicaciones.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];

// DEPARTAMENTOS
// Ver todos los departamentos - GET
router.get('/', soloAdmin, ubicacionController.listarDepartamentos);

// Crear departamento - POST
router.post('/', soloAdmin, ubicacionController.crearDepartamento);

// Obtener departamento por ID - GET
router.get('/:id', soloAdmin, ubicacionController.verDepartamentoPorId);

// ZONAS
// Ver zona - GET
router.get('/zonas/:id', soloAdmin, ubicacionController.verZona);

// Ver zonas de un departamento - GET
router.get('/:id/zonas', soloAdmin, ubicacionController.verZonasPorDepartamento);

// Crear zona - POST
router.post('/:id/zonas', soloAdmin, ubicacionController.crearZona);

// Editar zona - PUT
router.put('/zonas/:id', soloAdmin, ubicacionController.editarZona);

// Eliminar zona - DELETE
router.delete('/zonas/:id', soloAdmin, ubicacionController.eliminarZona);



module.exports = router;