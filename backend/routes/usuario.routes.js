const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const usuarioController = require('../controller/usuario.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];

// USUARIOS
// Ver todos los usuarios - GET
router.get('/',soloAdmin, usuarioController.listar);

// Ver detalles de un usuario - GET
router.get('/:id',soloAdmin, usuarioController.detalle);

// Actualizar usuario - PUT
router.put('/configuracion', verificarToken, verificarRol('administrador, operador'), usuarioController.editar);

// Ruta para cambio de contraseña del usuario autenticado - PUT
router.post('/cambiar-password', verificarToken, usuarioController.cambiarContraseña);

// Actualizar estado de usuario (activo/inactivo) - PUT
router.put('/:id/estado', soloAdmin, usuarioController.toggleEstadoUsuario);

// Restablecer contraseña de un usuario por ID (solo admin) - PUT
router.put('/:id/resetear-password', soloAdmin, usuarioController.resetearContraseñaAdmin);

module.exports = router;