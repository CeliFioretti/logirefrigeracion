const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const departamentoController = require('../controller/ubicaciones.controller.js')

// DEPARTAMENTOS
// Ver todos los departamentos - GET
router.get('/ubicaciones', verificarToken, verificarRol('Administrador'), departamentoController.listarDepartamentos);

// Crear departamento - POST
router.post('/ubicaciones', verificarToken, verificarRol('Administrador'), departamentoController.crearDepartamento);

// ZONAS
// Ver zona - GET
router.get('/ubicaciones/zonas/:id', verificarToken, verificarRol('Administrador'), departamentoController.verZona);

// Ver zonas de un departamento - GET
router.get('/ubicaciones/:id/zonas', verificarToken, verificarRol('Administrador'), departamentoController.verZonasPorDepartamento);

// Crear zona - POST
router.post('/ubicaciones/:id/zonas', verificarToken, verificarRol('Administrador'), departamentoController.crearZona);

// Editar zona - PUT
router.put('/ubicaciones/zonas/:id', verificarToken, verificarRol('Administrador'), departamentoController.editarZona);

// Eliminar zona - DELETE
router.delete('/ubicaciones/zonas/:id', verificarToken, verificarRol('Administrador'), departamentoController.eliminarZona);



module.exports = router;