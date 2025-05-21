const express = require('express');
const router = express.Router();
const departamentoController = require('../controller/ubicaciones.controller.js')

// DEPARTAMENTOS
// Ver todos los departamentos
router.get('/ubicaciones', departamentoController.listarDepartamentos);

// Crear departamento
router.post('/ubicaciones', departamentoController.crearDepartamento);


// ZONAS
// Ver zona
router.get('/ubicaciones/zonas/:id', departamentoController.verZona);

// Ver zonas de un departamento
router.get('/ubicaciones/:id/zonas', departamentoController.verZonasPorDepartamento);

// Crear zona
router.post('/ubicaciones/:id/zonas', departamentoController.crearZona);

// Editar zona
router.put('/ubicaciones/zonas/:id', departamentoController.editarZona);

// Eliminar zona
router.delete('/ubicaciones/zonas/:id', departamentoController.eliminarZona);



module.exports = router;