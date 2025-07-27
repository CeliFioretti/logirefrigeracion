const express = require('express');
const router = express.Router();
const verificarRol = require('../middlewares/verificarRol.js')
const verificarToken = require('../middlewares/verificarToken.js');
const clientesController = require('../controller/clientes.controller.js')

// Uso de Middlewares para verificar
const soloAdmin = [verificarToken, verificarRol('administrador')];
const adminYOperador = [verificarToken, verificarRol('administrador', 'operador')]; 

// CLIENTES
// Ver todos los clientes - GET
router.get('/', adminYOperador, clientesController.listar);

// Ver detalles de un cliente - GET
router.get('/:id', soloAdmin, clientesController.detalle);

// Crea un cliente - POST
router.post('/', soloAdmin, clientesController.crear);

// Actualizar cliente - PUT
router.put('/:id', soloAdmin, clientesController.editar);

// Eliminar cliente - DELETE
router.delete('/:id', soloAdmin, clientesController.eliminar);

// Obtener el cliente con más freezers - GET
router.get('/estadistica/mas-freezers', soloAdmin, clientesController.getClienteConMasFreezers);



module.exports = router;