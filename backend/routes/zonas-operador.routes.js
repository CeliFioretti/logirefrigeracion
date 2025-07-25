const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js');
const verificarToken = require('../middlewares/verificarToken.js');
const zonasOperadorController = require('../controller/zonas-operador.controller.js');

// Middleware para operadores
const soloOperador = [verificarToken, verificarRol('operador')];

// Ver mis zonas asignadas (Operador) - GET
router.get('/mis-zonas', soloOperador, zonasOperadorController.verMisZonasAsignadas);

module.exports = router;
