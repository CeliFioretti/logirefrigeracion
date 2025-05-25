const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const ubicacionController = require('../controller/ubicaciones.controller.js')

// DEPARTAMENTOS
// Ver todos los departamentos - GET
router.get('/', verificarToken, verificarRol('Administrador'), ubicacionController.listarDepartamentos);

// Crear departamento - POST
router.post('/', verificarToken, verificarRol('Administrador'), ubicacionController.crearDepartamento);

// ZONAS
// Ver zona - GET
router.get('/zonas/:id', verificarToken, verificarRol('Administrador'), ubicacionController.verZona);

// Ver zonas de un departamento - GET
router.get('/:id/zonas', verificarToken, verificarRol('Administrador'), ubicacionController.verZonasPorDepartamento);

// Crear zona - POST
router.post('/:id/zonas', verificarToken, verificarRol('Administrador'), ubicacionController.crearZona);

// Editar zona - PUT
router.put('/zonas/:id', verificarToken, verificarRol('Administrador'), ubicacionController.editarZona);

// Eliminar zona - DELETE
router.delete('/zonas/:id', verificarToken, verificarRol('Administrador'), ubicacionController.eliminarZona);



module.exports = router;