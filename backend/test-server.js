console.log('🚀 Iniciando test server...');

const http = require('http');
const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  console.log('📥 Request recibido:', req.url);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Test server funcionando',
    timestamp: new Date().toISOString(),
    port: PORT,
    url: req.url
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server corriendo en puerto ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Error:', err);
});