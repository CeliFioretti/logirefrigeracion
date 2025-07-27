require('dotenv').config();
const mysql = require('mysql2');

// Crea la conexión con las variables de entorno cargadas
const connection = mysql.createConnection({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,   
  port: process.env.DB_PORT || 3306 
});

// Conectar y mostrar mensaje en consola
connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos correctamente');
  }
});

module.exports = connection;