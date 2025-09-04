const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Report = require('./models/Report');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('=== INICIANDO SERVIDOR ===');
console.log('Puerto:', PORT);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'CONFIGURADO' : 'NO CONFIGURADO');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reportes_sistema');
    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Crear usuario de prueba si no existe
    const bcrypt = require('bcrypt');
    const testUser = await User.findOne({ email: 'test@test.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const newTestUser = new User({
        name: 'Usuario de Prueba',
        email: 'test@test.com',
        department: 'medicare',
        password: hashedPassword,
        role: 'leader',
        active: true
      });
      await newTestUser.save();
      console.log('✅ Usuario de prueba creado: test@test.com / 123456');
    }
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
};

connectDB();

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'https://accounts.google.com',
    /\.onrender\.com$/,  // Permite todos los dominios de Render
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Middleware adicional para CORS
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    res.sendStatus(200);
  } else {
    next();
  }
});

// Ruta de health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor de Reportes funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas
app.use('/api', authRoutes);



// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Google OAuth deshabilitado temporalmente



// MongoDB ya maneja los datos

// Rutas protegidas
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ 
    message: `Bienvenido ${req.user.name}`,
    role: req.user.role,
    department: req.user.department
  });
});

// Ruta para actualizar reportes con nombres de líderes
app.get('/api/fix-leaders', authenticateToken, async (req, res) => {
  try {
    // Buscar reportes que tienen email en leaderId
    const reports = await Report.find({ leaderId: { $regex: '@', $options: 'i' } });
    
    let updated = 0;
    for (const report of reports) {
      // Buscar el usuario por email
      const user = await User.findOne({ email: report.leaderId });
      if (user && user.name) {
        report.leaderId = user.name;
        await report.save();
        updated++;
        console.log(`Actualizado: ${report.leaderId} (era ${user.email})`);
      }
    }
    
    res.json({ message: `${updated} reportes actualizados con nombres de líderes` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para empleados
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'leader') {
      // Si es seguros_generales, mostrar empleados de auto, casa y comercial
      if (req.user.department === 'seguros_generales') {
        query.department = { $in: ['auto', 'casa', 'comercial', 'seguros_generales'] };
      } else {
        query.department = req.user.department;
      }
    }
    
    const employees = await Employee.find(query);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo empleados' });
  }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'leader') {
    return res.status(403).json({ message: 'Solo líderes pueden añadir empleados' });
  }
  
  try {
    const { name } = req.body;
    
    // Obtener el nombre actual del líder desde la BD
    const leader = await User.findOne({ email: req.user.email });
    const leaderName = leader ? leader.name : req.user.name;
    
    console.log('Creando empleado con líder:', leaderName);
    
    const newEmployee = new Employee({
      name,
      department: req.user.department,
      leaderId: leaderName  // NOMBRE DEL LÍDER, NO EMAIL
    });
    
    await newEmployee.save();
    res.json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error creando empleado' });
  }
});

// Rutas para reportes
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    let { employeeId, date, cantidadVentas, montoVentas, descripcion, comentarios } = req.body;
    
    console.log('=== CREANDO REPORTE ===');
    console.log('Datos recibidos:', { employeeId, date, cantidadVentas, montoVentas, descripcion, comentarios });
    
    // Arreglar employeeId si viene como objeto
    if (typeof employeeId === 'object' && employeeId._id) {
      console.log('employeeId era objeto, extrayendo _id:', employeeId._id);
      employeeId = employeeId._id;
    }
    
    console.log('employeeId final:', employeeId);
    
    // Obtener el nombre del empleado
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    console.log('Empleado encontrado:', employee.name);
    
    // Obtener el nombre actual del líder desde la BD
    const leader = await User.findOne({ email: req.user.email });
    const leaderName = leader ? leader.name : req.user.name;
    
    console.log('Líder (usuario):', leaderName);
    console.log('Departamento:', req.user.department);
    
    // Crear fecha válida
    const reportDate = new Date(date + 'T12:00:00.000Z');
    
    // Verificar si ya existe un reporte
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const existingReport = await Report.findOne({
      employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      leaderId: leaderName
    });
    
    if (existingReport) {
      console.log('Reporte duplicado encontrado, actualizando...');
      existingReport.cantidadVentas = parseInt(cantidadVentas) || 0;
      existingReport.montoVentas = parseFloat(montoVentas) || 0;
      existingReport.descripcion = descripcion || '';
      existingReport.comentarios = comentarios || '';
      existingReport.employeeName = employee.name; // Agregar nombre del empleado
      existingReport.leaderId = leaderName; // Actualizar nombre del líder
      
      await existingReport.save();
      console.log('Reporte actualizado:', existingReport);
      return res.json(existingReport);
    }
    
    const newReport = new Report({
      employeeId,
      employeeName: employee.name, // Guardar el nombre directamente
      date: reportDate,
      cantidadVentas: parseInt(cantidadVentas) || 0,
      montoVentas: parseFloat(montoVentas) || 0,
      descripcion: descripcion || '',
      comentarios: comentarios || '',
      leaderId: leaderName, // Guardar el nombre del líder desde BD
      department: req.user.department
    });
    
    await newReport.save();
    console.log('Nuevo reporte creado:', newReport);
    res.json(newReport);
  } catch (error) {
    console.error('Error creando reporte:', error);
    res.status(500).json({ message: 'Error creando reporte: ' + error.message });
  }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // Si es líder, solo sus reportes
    if (req.user.role === 'leader') {
      const leader = await User.findOne({ email: req.user.email });
      const leaderName = leader ? leader.name : req.user.name;
      query.leaderId = leaderName;
    }
    
    // Filtros para el jefe
    if (req.user.role === 'boss') {
      const { department, leader, dateFrom, dateTo, employee } = req.query;
      
      console.log('=== FILTROS JEFE ===');
      console.log('Filtro empleado recibido:', employee);
      
      if (department) query.department = department;
      if (leader) query.leaderId = { $regex: leader, $options: 'i' };
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) {
          const [year, month, day] = dateFrom.split('-');
          query.date.$gte = new Date(year, month - 1, day, 0, 0, 0);
        }
        if (dateTo) {
          const [year, month, day] = dateTo.split('-');
          query.date.$lte = new Date(year, month - 1, day, 23, 59, 59);
        }
      }
    }
    
    console.log('Query inicial:', query);
    
    // Obtener reportes con populate de empleado
    const reports = await Report.find(query)
      .populate('employeeId', 'name')
      .sort({ date: -1 });
    
    console.log('Total reportes antes de filtrar:', reports.length);
    
    // Filtrar por empleado DESPUÉS del populate
    let filteredReports = reports;
    if (req.user.role === 'boss' && req.query.employee) {
      console.log('Filtrando por empleado:', req.query.employee);
      filteredReports = reports.filter(report => {
        const employeeName = report.employeeId?.name || report.employeeName;
        const match = employeeName && employeeName.toLowerCase().includes(req.query.employee.toLowerCase());
        console.log(`Empleado: "${employeeName}" - Match: ${match}`);
        return match;
      });
      console.log('Reportes después del filtro:', filteredReports.length);
    }
    
    // Enriquecer reportes
    const enrichedReports = filteredReports.map(report => {
      const reportObj = report.toObject();
      reportObj.employeeName = report.employeeId?.name || report.employeeName || 'Sin nombre';
      return reportObj;
    });
    
    console.log('Reportes finales:', enrichedReports.length);
    res.json(enrichedReports);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ message: 'Error obteniendo reportes' });
  }
});

// Manejo de errores globales
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promesa rechazada no manejada:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log('✨ Servidor listo para recibir conexiones');
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});