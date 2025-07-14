import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard`)
        .then(response => {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('=== LOGIN MANUAL FRONTEND ===');
    console.log('Email:', email);
    
    try {
      console.log('Enviando request a backend...');
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/login`, { email, password });
      console.log('Respuesta del backend:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      console.log('Login exitoso, usuario:', user);
      return { success: true };
    } catch (error) {
      console.error('=== ERROR EN LOGIN MANUAL ===');
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      
      const message = error.response?.data?.message || 'Error de conexión';
      return { success: false, message };
    }
  };

  const googleLogin = async (googleToken) => {
    console.log('=== GOOGLE LOGIN FRONTEND ===');
    console.log('Token recibido:', googleToken ? 'SÍ' : 'NO');
    
    try {
      console.log('Enviando request a backend...');
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`, { 
        token: googleToken 
      });
      console.log('Respuesta del backend:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      console.log('Login exitoso, usuario:', user);
      return true;
    } catch (error) {
      console.error('=== ERROR EN GOOGLE LOGIN ===');
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}