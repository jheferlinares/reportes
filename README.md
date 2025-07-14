# Sistema de Reportes de Ventas

## 🚀 Despliegue en Render

### Pasos para desplegar:

1. **Crear cuenta en Render.com**
2. **Subir código a GitHub**
3. **Conectar repositorio en Render**
4. **Configurar variables de entorno**

### Variables de entorno necesarias:

**Backend:**
- `MONGODB_URI`: URL de MongoDB Atlas
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: 5000
- `NODE_ENV`: production

**Frontend:**
- `REACT_APP_API_URL`: URL del backend desplegado

### Estructura del proyecto:
```
reportes/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── models/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── public/
└── render.yaml
```

### URLs después del despliegue:
- **Frontend:** https://reportes-frontend.onrender.com
- **Backend:** https://reportes-backend.onrender.com

### Usuarios de prueba:
- **Email:** test@test.com
- **Contraseña:** 123456
- **Rol:** leader