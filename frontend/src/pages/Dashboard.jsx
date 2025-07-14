import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('Usuario en Dashboard:', user);
      console.log('Rol del usuario:', user.role);
      
      // Redirección automática según el rol
      if (user.role === 'leader') {
        console.log('Redirigiendo a /leader');
        navigate('/leader', { replace: true });
      } else if (user.role === 'boss') {
        console.log('Redirigiendo a /boss');
        navigate('/boss', { replace: true });
      } else {
        console.log('Rol no reconocido:', user.role);
      }
    } else {
      console.log('No hay usuario en Dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bienvenido {user?.name}</h1>
        <button onClick={logout} style={{ padding: '8px 16px' }}>Cerrar Sesión</button>
      </div>
      <p>Redirigiendo a tu panel...</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Debug Info:</strong></p>
        <p>Usuario: {user?.name}</p>
        <p>Rol: {user?.role}</p>
        <p>Departamento: {user?.department}</p>
      </div>
    </div>
  );
}

export default Dashboard;