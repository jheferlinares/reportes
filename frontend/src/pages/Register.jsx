import React, { useState } from 'react'
import axios from 'axios'

function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const departments = [
    { value: 'all', label: 'Jefe/Administrador' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'vida', label: 'Vida' },
    { value: 'salud', label: 'Salud' },
    { value: 'seguros_generales', label: 'Seguros Generales (Auto, Casa, Comercial)' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/register`, formData)
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear la cuenta')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <div style={{ 
          position: 'relative',
          maxWidth: '500px', 
          width: '100%',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          {/* Fondo borroso */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/fondo.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)',
            zIndex: -1
          }}></div>
          
          {/* Contenido nítido */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#28a745', 
              borderRadius: '50%', 
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>¡Solicitud Enviada!</h2>
            <p style={{ color: '#fff', fontSize: '16px', lineHeight: '1.5', marginBottom: '30px' }}>
              Tu solicitud de acceso ha sido enviada correctamente.
              <br /><br />
              <strong>El administrador revisará tu solicitud y te dará acceso pronto.</strong>
              <br /><br />
              Recibirás una notificación cuando tu cuenta esté activa.
            </p>
            <button
              onClick={onSwitchToLogin}
              style={{
                padding: '12px 30px',
                backgroundColor: '#0E1373',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ 
        position: 'relative',
        maxWidth: '400px', 
        width: '100%',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}>
        {/* Fondo borroso */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/fondo.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
          zIndex: -1
        }}></div>
        
        {/* Contenido nítido */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#fff', marginBottom: '10px' }}>Crear Cuenta</h1>
            <p style={{ color: '#fff', fontSize: '16px' }}>Solicita acceso al sistema</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nombre completo:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Tu nombre completo"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email corporativo:
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@ensuritygroup.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Departamento:
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="">Selecciona tu departamento</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Contraseña:
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Confirmar Contraseña:
              </label>
              <input
                type="password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Repite tu contraseña"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8d7da',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#ccc' : '#0E1373',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: '#fff' }}>¿Ya tienes cuenta? </span>
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register