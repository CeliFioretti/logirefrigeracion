const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const auditoriaController = require('../controller/auditoria.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
// DEPARTAMENTOS
// Ver todos los registros de auditoría - GET
router.get('/', soloAdmin, auditoriaController.listar);


module.exports = router;