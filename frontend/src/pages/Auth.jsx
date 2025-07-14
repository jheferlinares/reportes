import React, { useState } from 'react'
import Login from './Login.jsx'
import Register from './Register.jsx'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("/fondo.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}

export default Auth