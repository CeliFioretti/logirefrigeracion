const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const auditoriaController = require('../controller/auditoria.controller.js')

// DEPARTAMENTOS
// Ver todos los registros de auditoría - GET
router.get('/', verificarToken, verificarRol('Administrador'), auditoriaController.listar);


module.exports = router;