const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const { name, email, department, password, confirmPassword } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }
    
    // Validar email único
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.active 
          ? 'Este email ya tiene una cuenta activa' 
          : 'Este email ya tiene una solicitud pendiente de aprobación'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      department,
      password: hashedPassword,
      role: 'pending',
      active: false
    });
    
    await newUser.save();
    res.json({ message: 'Solicitud enviada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'YES' : 'NO');
    
    if (!password) {
      return res.status(400).json({ message: 'Contraseña requerida' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found in DB:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('ERROR: User not found');
      return res.status(401).json({ message: 'Usuario no encontrado. ¿Necesitas crear una cuenta?' });
    }
    
    console.log('User active:', user.active);
    console.log('User role:', user.role);
    console.log('User has password:', user.password ? 'YES' : 'NO');
    
    if (!user.active || user.role === 'pending') {
      return res.status(401).json({ message: 'Tu cuenta está pendiente de aprobación por el administrador' });
    }
    
    // Verificar contraseña
    if (!user.password) {
      console.log('ERROR: User has no password configured');
      return res.status(401).json({ message: 'Usuario sin contraseña configurada' });
    }
    
    console.log('Comparing passwords...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('ERROR: Invalid password');
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    console.log('Contraseña válida para:', user.email);
    
    const token = jwt.sign(
      { 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        department: user.department 
      }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: {
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { register, login };