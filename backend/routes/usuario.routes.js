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

// Crea un usuario - POST
router.post('/',soloAdmin, usuarioController.crear);

// Actualizar usuario - PUT
router.put('/configuracion', verificarToken, verificarRol('administrador, operador'), usuarioController.editar);

// Eliminar usuario - DELETE
router.delete('/:id',soloAdmin, usuarioController.eliminar);

// Ruta para cambio de contraseña del usuario autenticado
router.post('/cambiar-password', verificarToken, usuarioController.cambiarContraseña);

module.exports = router;