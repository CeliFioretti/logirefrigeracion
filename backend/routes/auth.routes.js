const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller.js');

// AUTORIZACIÓN (LOGIN)
// Hacer login de usuario - POST
router.post('/login', authController.login);

// Registro de operador - POST
router.post('/registro', authController.registrarUsuario)

// El usuario solicita la recuperación de su contraseña - POST
router.post('/solicitar-recuperacion', authController.solicitarRecuperacion);

// Restrablecimiento de la contraseña al solicitar recuperación - POST
router.post('/restablecer-password', authController.restablecerPassword);


module.exports = router;