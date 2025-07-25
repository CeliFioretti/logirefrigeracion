const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js');
const verificarToken = require('../middlewares/verificarToken.js');
const eventosOperadorController = require('../controller/eventos-operador.controller.js');

// Middleware para operadores
const soloOperador = [verificarToken, verificarRol('operador')];

// Rutas para eventos del operador
router.get('/historial', soloOperador, eventosOperadorController.listarMisEventos);
router.post('/registrar', soloOperador, eventosOperadorController.registrarEventoOperador);

module.exports = router;