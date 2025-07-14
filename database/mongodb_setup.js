// Script para inicializar datos en MongoDB
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('')
  .then(() => {
    console.log('Conectado a MongoDB');
    console.log('Base de datos lista para usar');
    console.log('Colecciones: employees, reports');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });