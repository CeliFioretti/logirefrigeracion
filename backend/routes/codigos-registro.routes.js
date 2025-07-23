const express = require('express');
const router = express.Router();
const controladorCodigos = require('../controller/codigos-registro.controller');
const emailController = require('../controller/email-codigo.controller.js');
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];

// Crear un nuevo código - POST
router.post('/', soloAdmin, controladorCodigos.crear);

// Listar todos los códigos - GET
router.get('/', soloAdmin, controladorCodigos.listar);

// Listar solo códigos disponibles - GET
router.get('/disponibles', soloAdmin, controladorCodigos.listarDisponibles);

// Eliminar un código - DELETE
router.delete('/:id', soloAdmin, controladorCodigos.eliminar);

// Enviar un código por email - POST
router.post('/enviar-email', soloAdmin, emailController.sendCodeByEmail);

module.exports = router;
