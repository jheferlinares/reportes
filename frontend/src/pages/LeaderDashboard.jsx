import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'

function LeaderDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState({});
  const [existingReports, setExistingReports] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dayLocked, setDayLocked] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Cargar empleados y reportes desde la API
  useEffect(() => {
    loadEmployees();
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    try {
      const response = await axios.get('https://reportes-sm2g.onrender.com/api/reports');
      setExistingReports(response.data);
      
      // Cargar reportes del día seleccionado
      const dailyResponse = await axios.get(`https://reportes-sm2g.onrender.com/api/reports?dateFrom=${selectedDate}&dateTo=${selectedDate}`);
      setDailyReports(dailyResponse.data);
      
      // Verificar si el día está bloqueado (tiene reportes guardados)
      setDayLocked(dailyResponse.data.length > 0);
      
      // Pre-llenar los campos si hay reportes del día
      if (dailyResponse.data.length > 0) {
        const dayReports = {};
        dailyResponse.data.forEach(report => {
          dayReports[report.employeeId] = {
            cantidadVentas: report.cantidadVentas,
            montoVentas: report.montoVentas,
            descripcion: report.descripcion,
            comentarios: report.comentarios
          };
        });
        setReports(dayReports);
      } else {
        setReports({});
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await axios.get('https://reportes-sm2g.onrender.com/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) return;
    
    try {
      const response = await axios.post('https://reportes-sm2g.onrender.com/api/employees', {
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

  const handleReportChange = (employeeId, field, value) => {
    setReports(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setDayLocked(false);
  };
  
  const editEmployee = (employeeId) => {
    setEditingEmployeeId(employeeId);
  };
  
  const saveEmployeeReport = async (employeeId) => {
    try {
      const reportData = reports[employeeId];
      if (reportData && (reportData.cantidadVentas || reportData.montoVentas || reportData.descripcion)) {
        await axios.post('https://reportes-sm2g.onrender.com/api/reports', {
          employeeId: employeeId,
          date: selectedDate,
          cantidadVentas: parseInt(reportData.cantidadVentas) || 0,
          montoVentas: parseFloat(reportData.montoVentas) || 0,
          descripcion: reportData.descripcion || '',
          comentarios: reportData.comentarios || ''
        });
        alert('Reporte guardado exitosamente');
        setEditingEmployeeId(null);
        loadReports();
      } else {
        alert('Agrega al menos un dato para guardar');
      }
    } catch (error) {
      alert('Error al guardar: ' + (error.response?.data?.message || error.message));
    }
  };

  const saveReports = async () => {
    try {
      if (employees.length === 0) {
        alert('No hay empleados. Primero agrega empleados.');
        return;
      }
      
      const reportPromises = [];
      
      // Filtrar solo empleados con IDs válidos
      const validEmployees = employees.filter(emp => 
        emp._id && 
        typeof emp._id === 'string' && 
        emp._id !== '[object Object]' &&
        emp._id.length === 24 // MongoDB ObjectId length
      );
      
      console.log('🔍 Empleados válidos:', validEmployees.length, 'de', employees.length);
      
      for (const employee of validEmployees) {
        const reportData = reports[employee._id];
        if (reportData && (reportData.cantidadVentas || reportData.montoVentas || reportData.descripcion)) {
          reportPromises.push(
            axios.post('https://reportes-sm2g.onrender.com/api/reports', {
              employeeId: employee._id,
              date: selectedDate,
              cantidadVentas: parseInt(reportData.cantidadVentas) || 0,
              montoVentas: parseFloat(reportData.montoVentas) || 0,
              descripcion: reportData.descripcion || '',
              comentarios: reportData.comentarios || ''
            })
          );
        }
      }
      
      if (reportPromises.length === 0) {
        alert('No hay datos para guardar');
        return;
      }
      
      // Usar Promise.allSettled para manejar errores individuales
      const results = await Promise.allSettled(reportPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        alert(`${successful} reportes guardados exitosamente${failed > 0 ? ` (${failed} fallaron)` : ''}`);
        
        // Bloquear el día y salir del modo edición
        setDayLocked(true);
        setIsEditMode(false);
        
        // Recargar reportes para mostrar los guardados
        loadReports();
      } else {
        alert('Error: No se pudo guardar ningún reporte');
      }
    } catch (error) {
      console.error('Error guardando reportes:', error);
      alert('Error al guardar reportes: ' + (error.response?.data?.message || error.message));
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

        {/* Resumen del Día */}
        {dayLocked && !isEditMode && dailyReports.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2d3748', margin: 0 }}>Resumen del {new Date(selectedDate).toLocaleDateString('es-ES')}</h2>
              <button
                onClick={enableEditMode}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ed8936',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ✏️ Editar Reportes
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <h3 style={{ color: '#667eea', margin: '0 0 5px 0' }}>{user.department.toUpperCase()}</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                  {dailyReports.reduce((sum, r) => sum + (r.cantidadVentas || 0), 0)} ventas
                </p>
                <p style={{ fontSize: '16px', margin: '5px 0 0 0', color: '#28a745' }}>
                  ${dailyReports.reduce((sum, r) => sum + (r.montoVentas || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f7fafc' }}>
                    <th style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Empleado</th>
                    <th style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>Ventas</th>
                    <th style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>Monto</th>
                    <th style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReports.map(report => (
                    <tr key={report._id}>
                      <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>{report.employeeName}</td>
                      <td style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{report.cantidadVentas}</td>
                      <td style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>${report.montoVentas}</td>
                      <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>{report.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>
          {editingEmployeeId ? 'Editando Empleado' : 'Empleados'}
        </h2>
        
        {/* Vista de lista de empleados */}
        {!editingEmployeeId && (
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            padding: '25px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>Selecciona un empleado para editar:</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {employees.map(employee => (
                <div key={employee._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
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
                  <button
                    onClick={() => editEmployee(employee._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Vista de edición individual */}
        {editingEmployeeId && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {employees.filter(emp => emp._id === editingEmployeeId).map(employee => (
            <div key={employee._id} style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '25px', 
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ color: '#2d3748', margin: 0, fontSize: '20px' }}>{employee.name}</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ color: '#4a5568', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Cantidad de Ventas:</label>
                  <input
                    type="number"
                    placeholder="Número de ventas"
                    value={reports[employee._id]?.cantidadVentas || ''}
                    onChange={(e) => handleReportChange(employee._id, 'cantidadVentas', e.target.value)}
                    disabled={dayLocked && !isEditMode}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: dayLocked && !isEditMode ? '#f5f5f5' : 'white',
                      cursor: dayLocked && !isEditMode ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#4a5568', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Monto en Ventas ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={reports[employee._id]?.montoVentas || ''}
                    onChange={(e) => handleReportChange(employee._id, 'montoVentas', e.target.value)}
                    disabled={dayLocked && !isEditMode}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: dayLocked && !isEditMode ? '#f5f5f5' : 'white',
                      cursor: dayLocked && !isEditMode ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: '#4a5568', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Descripción de Ventas:</label>
                  <input
                    type="text"
                    placeholder="Detalle de las ventas realizadas"
                    value={reports[employee._id]?.descripcion || ''}
                    onChange={(e) => handleReportChange(employee._id, 'descripcion', e.target.value)}
                    disabled={dayLocked && !isEditMode}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: dayLocked && !isEditMode ? '#f5f5f5' : 'white',
                      cursor: dayLocked && !isEditMode ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ color: '#4a5568', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Comentarios:</label>
                <textarea
                  placeholder="Comentarios adicionales sobre el desempeño..."
                  value={reports[employee._id]?.comentarios || ''}
                  onChange={(e) => handleReportChange(employee._id, 'comentarios', e.target.value)}
                  disabled={dayLocked && !isEditMode}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '100px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                    backgroundColor: dayLocked && !isEditMode ? '#f5f5f5' : 'white',
                    cursor: dayLocked && !isEditMode ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>
          ))}
        )}
        
        {/* Botones para edición individual */}
        {editingEmployeeId && (
          <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => saveEmployeeReport(editingEmployeeId)}
              style={{ 
                padding: '16px 32px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Guardar Reporte
            </button>
            <button 
              onClick={() => setEditingEmployeeId(null)}
              style={{ 
                padding: '16px 32px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Botón para guardar todos (solo si no está editando individualmente) */}
        {!editingEmployeeId && (!dayLocked || isEditMode) && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              onClick={saveReports}
              style={{ 
                padding: '16px 32px', 
                backgroundColor: '#deeaf9ff', 
                color: '#0A0C26', 
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Guardar Todos los Reportes
            </button>
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
                    await axios.post('https://reportes-sm2g.onrender.com/api/reports', {
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