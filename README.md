# ImpulsaCol Backend

Backend del proyecto ImpulsaCol desarrollado con Node.js, Express, TypeScript y TypeORM.

## 🚀 Configuración para Producción

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=impulsacol

# Configuración de JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Configuración del Servidor
PORT=3000

# Configuración de Email (para recuperación de contraseña)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# IP Local para desarrollo (opcional)
LOCAL_IP=192.168.1.100

# Variables para producción
NODE_ENV=production
```

### 🛠️ Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
```bash
# Ejecutar migraciones
npm run migration:run
```

3. **Modo desarrollo:**
```bash
npm run dev
```

4. **Modo producción:**
```bash
npm run build
npm start
```

### 🌐 Configuración de Dominio

El backend está configurado para funcionar con:

- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://impulsacol.twentybyte.com`

### 📋 CORS Configurado

El servidor acepta peticiones desde:
- `http://localhost:19000` (Expo desarrollo)
- `http://localhost:19006` (Expo web)
- `http://localhost:8081` (Metro bundler)
- `http://localhost:3000` (Frontend web local)
- `https://impulsacol.twentybyte.com` (Dominio de producción)
- IPs locales dinámicas para desarrollo

### 🗄️ Base de Datos

El proyecto usa PostgreSQL. Asegúrate de tener una base de datos configurada y las migraciones ejecutadas.

### 📂 Estructura del Proyecto

```
src/
├── application/          # Servicios de aplicación
├── domain/              # Modelos y lógica de dominio
├── infrastructure/      # Configuración e implementaciones
│   ├── adapters/       # Adaptadores externos
│   ├── config/         # Configuración de DB y otros
│   ├── persistence/    # Repositorios y entidades
│   └── web/           # Controladores y rutas
└── types/              # Tipos TypeScript
```

### 🔒 Seguridad

- JWT para autenticación
- Bcrypt para hash de contraseñas
- CORS configurado para dominios específicos
- Validaciones en todas las entradas

### 📋 Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm run build` - Compilar TypeScript
- `npm run migration:generate` - Generar nueva migración
- `npm run migration:run` - Ejecutar migraciones
- `npm run migration:revert` - Revertir migración 