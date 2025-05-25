const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const usuarioController = require('../controller/usuario.controller.js')

// USUARIOS
// Ver todos los usuarios - GET
router.get('/', verificarToken, verificarRol('Administrador'), usuarioController.listar);

// Ver detalles de un usuario - GET
router.get('/:id', verificarToken, verificarRol('Administrador'), usuarioController.detalle);

// Crea un usuario - POST
router.post('/', verificarToken, verificarRol('Administrador'), usuarioController.crear);

// Actualizar usuario - PUT
router.put('/configuracion', verificarToken, verificarRol('Administrador, Operador'), usuarioController.editar);

// Eliminar usuario - DELETE
router.delete('/:id', verificarToken, verificarRol('Administrador'), usuarioController.eliminar);



module.exports = router;