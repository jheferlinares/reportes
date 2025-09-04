import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'

function LeaderDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  // Cargar empleados desde la API
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://reportes-sm2g.onrender.com';
      const response = await axios.get(`${apiUrl}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://reportes-sm2g.onrender.com';
      const response = await axios.post(`${apiUrl}/api/employees`, {
        name: newEmployeeName
      });
      
      setEmployees([...employees, response.data]);
      setNewEmployeeName('');
      setShowAddEmployee(false);
    } catch (error) {
      console.error('Error añadiendo empleado:', error);
      alert('Error al añadir empleado');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0C26 0%, #0E1373 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2d3748', fontSize: '28px' }}>Panel de Líder</h1>
            <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '16px' }}>
              {user.name.toUpperCase()} - Departamento {user.department.toUpperCase()}
            </p>
          </div>
          <button 
            onClick={logout} 
            style={{ 
              padding: '12px 24px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Controles */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <button 
            onClick={() => setShowAddEmployee(true)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#48bb78', 
              color: 'white', 
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Añadir Empleado
          </button>
        </div>

        {showAddEmployee && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            padding: '25px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: '2px solid #48bb78'
          }}>
            <h4 style={{ color: '#2d3748', marginBottom: '20px', fontSize: '18px' }}>Añadir Nuevo Empleado</h4>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Nombre completo del empleado"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  flex: 1,
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={addEmployee}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#48bb78', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
              <button 
                onClick={() => { setShowAddEmployee(false); setNewEmployeeName(''); }}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#a0aec0', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de empleados */}
        {employees.length > 0 && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            padding: '25px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>Empleados del Departamento:</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {employees.map(employee => (
                <div key={employee._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#667eea',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>{employee.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderDashboard;