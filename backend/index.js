// Archivo .env
require('dotenv').config();

// Express.js
const express = require('express');
const app = express();
const puerto = 3200;

// Middlewares
const errorHandler = require('./middlewares/errorHandler.js');

// Rutas
const rutaAuth = require('./routes/auth.routes.js');
const rutaUsuario = require('./routes/usuario.routes.js');
const rutaFreezer = require('./routes/freezers.routes.js');
const rutaClientes = require('./routes/clientes.routes.js');
const rutaEventosFreezer = require('./routes/eventos.routes.js');
const rutasUbicaciones = require('./routes/ubicaciones.routes.js');
const rutaAuditoria = require('./routes/auditoria.routes.js');

app.use(express.json());

app.use('/auth', rutaAuth);
app.use('/usuarios', rutaUsuario);
app.use('/freezers', rutaFreezer);
app.use('/clientes', rutaClientes)
app.use('/eventos', rutaEventosFreezer)
app.use('/ubicaciones', rutasUbicaciones);
app.use('/auditoria', rutaAuditoria);


app.use(errorHandler);


// Servidor
app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`)
    console.log('Modo actual:', process.env.NODE_ENV);

})
