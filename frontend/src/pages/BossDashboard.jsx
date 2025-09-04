import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'

function BossDashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    departamento: '',
    persona: '',
    lider: ''
  });
  const [reports, setReports] = useState([]);

  const departments = ['medicare', 'vida', 'salud', 'seguros_generales'];
  const leaders = ['Alfonso', 'Dilenia', 'Olider', 'Yohanni', 'Brigetle'];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const searchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.departamento) params.append('department', filters.departamento);
      if (filters.lider) params.append('leader', filters.lider);
      if (filters.fechaInicio) params.append('dateFrom', filters.fechaInicio);
      if (filters.fechaFin) params.append('dateTo', filters.fechaFin);
      if (filters.persona) params.append('employee', filters.persona);
      
      console.log('Filtros aplicados:', filters);
      console.log('URL de búsqueda:', `http://localhost:5000/api/reports?${params}`);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'https://reportes-sm2g.onrender.com';
      const response = await axios.get(`${apiUrl}/api/reports?${params}`);
      console.log('Reportes recibidos:', response.data);
      setReports(response.data);
    } catch (error) {
      console.error('Error buscando reportes:', error);
      setReports([]);
    }
  };
  
  useEffect(() => {
    searchReports();
  }, []);

  const clearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      departamento: '',
      persona: '',
      lider: ''
    });
    setReports([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Panel Ejecutivo - {user.name}</h1>
        <button onClick={logout} style={{ padding: '8px 16px' }}>Cerrar Sesión</button>
      </div>

      {/* Filtros */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h3>Filtros de Búsqueda</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginTop: '15px'
        }}>
          <div>
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Departamento:</label>
            <select
              value={filters.departamento}
              onChange={(e) => handleFilterChange('departamento', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Todos</option>
              {departments.map(dept => {
                const labels = {
                  'medicare': 'MEDICARE',
                  'vida': 'VIDA', 
                  'salud': 'SALUD',
                  'seguros_generales': 'CASA, AUTO Y COMERCIAL'
                };
                return (
                  <option key={dept} value={dept}>{labels[dept]}</option>
                );
              })}
            </select>
          </div>
          <div>
            <label>Líder:</label>
            <select
              value={filters.lider}
              onChange={(e) => handleFilterChange('lider', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Todos</option>
              {leaders.map(leader => (
                <option key={leader} value={leader}>{leader}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Empleado:</label>
            <input
              type="text"
              placeholder="Nombre del empleado"
              value={filters.persona}
              onChange={(e) => handleFilterChange('persona', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={searchReports}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            Buscar Reportes
          </button>
          <button 
            onClick={clearFilters}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Totales Generales */}
      {reports.length > 0 && (
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
              {new Set(reports.map(r => r.employeeId)).size}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Total Líderes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {new Set(reports.map(r => r.leaderId)).size}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Total Ventas</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#333' }}>
              {reports.reduce((sum, r) => sum + (r.cantidadVentas || 0), 0)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0E1373', margin: '0 0 5px 0' }}>Monto Total</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#28a745' }}>
              ${reports.reduce((sum, r) => sum + (r.montoVentas || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Resultados */}
      {reports.length > 0 && (
        <div>
          <h3>Resultados ({reports.length} reportes encontrados)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Fecha</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Departamento</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Líder</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Empleado</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ventas ($)</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Descripción</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd' }}>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{new Date(report.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.department?.toUpperCase()}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.leaderId}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.employeeName}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      Cant: {report.cantidadVentas} | ${report.montoVentas?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.descripcion}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{report.comentarios}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BossDashboard;