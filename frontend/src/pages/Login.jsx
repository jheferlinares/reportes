import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
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
        {/* Título principal del sistema */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#fff', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            SISTEMA DE REPORTES
          </h1>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            backgroundColor: '#007bff', 
            margin: '0 auto 20px auto',
            borderRadius: '2px'
          }}></div>
        </div>
        
        {/* Sección de login con logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Espacio para logo */}
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(255, 255, 255, 0.4)'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo Empresa" 
              style={{
                width: '90px', 
                height: '90px', 
                borderRadius: '8px',
                objectFit: 'contain'
              }} 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '12px',
                display: 'none'
              }}
            >
              LOGO
            </span>
          </div>
          
          {/* Título de la sección */}
          <div>
            <h2 style={{ color: '#fff', marginBottom: '5px', fontSize: '24px' }}>Iniciar Sesión</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>Accede a tu cuenta</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ensuritygroup.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                opacity: loading ? 0.6 : 1
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
            disabled={loading || !email.trim() || !password.trim()}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading || !email.trim() || !password.trim() ? '#ccc' : '#0E1373',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading || !email.trim() || !password.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#fff' }}>¿No tienes cuenta? </span>
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Crear Cuenta
          </button>
        </div>
        </div>
      </div>
    </>
  )
}

export default Login