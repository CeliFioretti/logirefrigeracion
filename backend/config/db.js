const { Pool } = require('pg'); 
require('dotenv').config(); 

// Configuración para PostgreSQL en Render
const pool = new Pool({
    user: process.env.DB_USER,        
    host: process.env.DB_HOST,        
    database: process.env.DB_NAME,    
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,       
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos PostgreSQL:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos PostgreSQL correctamente');
});

module.exports = pool; 
