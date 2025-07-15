const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Iniciando servidor...');
console.log('Puerto:', PORT);

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  console.log('✅ Ruta / accedida');
  res.json({ 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Error del servidor:', err);
});