// Archivo .env
require('dotenv').config();

// Express.js
const express = require('express');
const app = express();
const puerto = 3200;

// Cors
const cors = require('cors');

// Middlewares
const errorHandler = require('./middlewares/errorHandler.js');

// Aumenta el límite de tamaño de la carga útil
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
const rutaAuth = require('./routes/auth.routes.js');
const rutaUsuario = require('./routes/usuario.routes.js');
const rutaDashboard = require('./routes/dashboard.routes.js');
const rutaNotificaciones = require('./routes/notificaciones.routes.js');
const rutaFreezer = require('./routes/freezers.routes.js');
const rutaClientes = require('./routes/clientes.routes.js');
const rutaMantenimientos = require('./routes/mantenimientos.routes.js');
const rutaAsignacionMantenimientos = require('./routes/asignaciones-mantenimiento.routes.js');
const rutaEventosFreezer = require('./routes/eventos.routes.js');
const rutasUbicaciones = require('./routes/ubicaciones.routes.js');
const rutaAuditoria = require('./routes/auditoria.routes.js');
const rutaCodigosRegistro = require('./routes/codigos-registro.routes.js');

app.use(cors({
    origin: `http://localhost:5173`,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use('/api/auth', rutaAuth);
app.use('/api/codigos-registro', rutaCodigosRegistro);
app.use('/api/usuarios', rutaUsuario);
app.use('/api/dashboard', rutaDashboard);
app.use('/api/notificaciones', rutaNotificaciones);
app.use('/api/freezers', rutaFreezer);
app.use('/api/clientes', rutaClientes);
app.use('/api/mantenimientos', rutaMantenimientos);
app.use('/api/asignaciones-mantenimiento', rutaAsignacionMantenimientos);
app.use('/api/eventos', rutaEventosFreezer);
app.use('/api/ubicaciones', rutasUbicaciones);
app.use('/api/auditoria', rutaAuditoria);


app.use(errorHandler);


// Servidor
app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`)
    console.log('Modo actual:', process.env.NODE_ENV);

})
