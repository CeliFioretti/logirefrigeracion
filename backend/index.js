// Archivo .env
require('dotenv').config();

// Express.js
const express = require('express');
const app = express();
const puerto = 3200;

// Middlewares
const errorHandler = require('./middlewares/errorHandler.js');

// Rutas
const rutasUbicaciones = require('./routes/ubicaciones.routes.js');
const rutaAuth = require('./routes/auth.routes.js');

app.use(express.json());

app.use('/', rutasUbicaciones);

app.use('/auth', rutaAuth);

app.use(errorHandler);


// Servidor
app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`)
    console.log('Modo actual:', process.env.NODE_ENV);

})
