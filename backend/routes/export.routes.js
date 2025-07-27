const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken.js');
const controladorExportPDF  = require('../controller/export.controller');

// Ruta para exportar clientes a PDF - GET
router.get('/clientes-pdf', verificarToken, controladorExportPDF.exportClientesToPdf);

module.exports = router;