import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'

function LeaderDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingReports, setExistingReports] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  // Cargar empleados y reportes desde la API
  useEffect(() => {
    loadEmployees();
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://reportes-sm2g.onrender.com';
      const response = await axios.get(`${apiUrl}/api/reports`);
      setExistingReports(response.data);
      
      // Cargar reportes del día seleccionado
      const dailyResponse = await axios.get(`${apiUrl}/api/reports?dateFrom=${selectedDate}&dateTo=${selectedDate}`);
      setDailyReports(dailyResponse.data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

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
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ color: '#2d3748', fontWeight: '500', fontSize: '16px' }}>Fecha del reporte:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
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

      {/* Totales */}
      {existingReports.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Total Empleados</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {new Set(existingReports.map(r => r.employeeId)).size}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Total Ventas</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {existingReports.reduce((sum, r) => sum + (r.cantidadVentas || 0), 0)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Monto Total</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>
              ${existingReports.reduce((sum, r) => sum + (r.montoVentas || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Reportes Existentes */}
      {existingReports.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Reportes Existentes</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Empleado</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Fecha</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ventas</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Monto</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {existingReports.map(report => (
                  <tr key={report._id}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.employeeName}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.cantidadVentas}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>${report.montoVentas}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => setEditingReport(report)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


        


      {/* Modal de Edición */}
      {editingReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3>Editar Reporte - {editingReport.employeeName}</h3>
            <div style={{ marginBottom: '15px' }}>
              <label>Cantidad de Ventas:</label>
              <input
                type="number"
                defaultValue={editingReport.cantidadVentas}
                onChange={(e) => setEditingReport({...editingReport, cantidadVentas: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Monto en Ventas ($):</label>
              <input
                type="number"
                step="0.01"
                defaultValue={editingReport.montoVentas}
                onChange={(e) => setEditingReport({...editingReport, montoVentas: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Descripción:</label>
              <input
                type="text"
                defaultValue={editingReport.descripcion}
                onChange={(e) => setEditingReport({...editingReport, descripcion: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Comentarios:</label>
              <textarea
                defaultValue={editingReport.comentarios}
                onChange={(e) => setEditingReport({...editingReport, comentarios: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingReport(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`${process.env.REACT_APP_API_URL || 'https://reportes-sm2g.onrender.com'}/api/reports`, {
                      employeeId: editingReport.employeeId,
                      date: editingReport.date,
                      cantidadVentas: editingReport.cantidadVentas,
                      montoVentas: editingReport.montoVentas,
                      descripcion: editingReport.descripcion,
                      comentarios: editingReport.comentarios
                    });
                    alert('Reporte actualizado exitosamente');
                    setEditingReport(null);
                    loadReports();
                  } catch (error) {
                    alert('Error al actualizar reporte');
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default LeaderDashboard;