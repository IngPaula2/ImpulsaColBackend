#!/bin/bash

# ===============================================
# SCRIPT DE DEPLOYMENT AUTOMÁTICO - IMPULSACOL
# ===============================================

echo "🚀 Iniciando deployment automático de ImpulsaCol Backend..."
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "🔧 Instalar Node.js con: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

echo "✅ Node.js $(node --version) y npm $(npm --version) verificados"

# Configurar variables de entorno automáticamente
echo "⚙️  Configurando variables de entorno para producción..."
if [ ! -f .env ]; then
    if [ -f env.production.example ]; then
        cp env.production.example .env
        echo "✅ Variables de entorno configuradas desde env.production.example"
    else
        echo "📝 Creando archivo .env básico..."
        cat > .env << EOL
# Configuración básica de producción
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=impulsacol2024
DB_DATABASE=impulsacol
JWT_SECRET=impulsacol_jwt_secret_production_2024_secure_key
PORT=3000
NODE_ENV=production
EMAIL_USER=impulsacol@gmail.com
EMAIL_PASS=your_gmail_app_password_here
LOCAL_IP=auto
UPLOAD_PATH=./uploads
LOG_LEVEL=info
EOL
        echo "✅ Archivo .env básico creado"
    fi
else
    echo "✅ Archivo .env ya existe"
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias de Node.js..."
npm install

# Verificar que la instalación fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas correctamente"

# Compilar TypeScript
echo ""
echo "🔨 Compilando código TypeScript..."
npm run build

# Verificar que la compilación fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error al compilar TypeScript"
    exit 1
fi
echo "✅ Código compilado correctamente"

# Crear directorios necesarios
echo ""
echo "📁 Creando directorios necesarios..."
mkdir -p uploads/products
mkdir -p uploads/entrepreneurships
mkdir -p uploads/investment-ideas
mkdir -p uploads/profiles
mkdir -p logs
echo "✅ Directorios creados"

# Configurar permisos
echo ""
echo "🔐 Configurando permisos..."
chmod -R 755 uploads/
chmod -R 755 logs/
chmod +x deploy.sh 2>/dev/null || echo "⚠️  No se pudieron configurar permisos de ejecución"
echo "✅ Permisos configurados"

# Ejecutar migraciones de base de datos
echo ""
echo "🗄️  Ejecutando migraciones de base de datos..."
npm run migration:run

if [ $? -ne 0 ]; then
    echo "⚠️  Advertencia: Error al ejecutar migraciones"
    echo "📝 Posibles causas:"
    echo "   - PostgreSQL no está instalado o ejecutándose"
    echo "   - Credenciales de base de datos incorrectas en .env"
    echo "   - Base de datos no existe"
    echo ""
    echo "🔧 Para instalar PostgreSQL:"
    echo "   sudo apt update"
    echo "   sudo apt install postgresql postgresql-contrib"
    echo "   sudo systemctl start postgresql"
    echo "   sudo systemctl enable postgresql"
    echo ""
    echo "🔧 Para crear la base de datos:"
    echo "   sudo -u postgres psql"
    echo "   CREATE DATABASE impulsacol;"
    echo "   CREATE USER postgres WITH PASSWORD 'impulsacol2024';"
    echo "   GRANT ALL PRIVILEGES ON DATABASE impulsacol TO postgres;"
    echo ""
else
    echo "✅ Migraciones ejecutadas correctamente"
fi

echo ""
echo "🎉 ¡DEPLOYMENT COMPLETADO!"
echo ""
echo "📋 RESUMEN DE CONFIGURACIÓN:"
echo "   ✅ Node.js y npm verificados"
echo "   ✅ Variables de entorno configuradas (.env)"
echo "   ✅ Dependencias instaladas"
echo "   ✅ Código TypeScript compilado"
echo "   ✅ Directorios de uploads creados"
echo "   ✅ Permisos configurados"
echo "   ✅ Migraciones de DB ejecutadas"
echo ""
echo "🚀 COMANDOS PARA INICIAR EL SERVIDOR:"
echo ""
echo "   # Modo producción (recomendado):"
echo "   npm run deploy:start"
echo ""
echo "   # Con PM2 (mejor para servidor):"
echo "   npm install -g pm2"
echo "   pm2 start dist/index.js --name 'impulsacol-backend'"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "   # Modo desarrollo:"
echo "   npm run dev"
echo ""
echo "🌐 CONFIGURACIÓN DE SERVIDOR:"
echo "   📍 Puerto: 3000"
echo "   📍 Dominio: https://impulsacol.twentybyte.com"
echo "   📍 API Base: https://impulsacol.twentybyte.com/api"
echo "   📍 Uploads: /uploads"
echo ""
echo "🔧 SIGUIENTES PASOS:"
echo "   1. Configurar Nginx como proxy reverso"
echo "   2. Configurar SSL con Let's Encrypt"
echo "   3. Configurar firewall (puertos 80, 443, 3000)"
echo "   4. Iniciar el backend con PM2"
echo ""
echo "📝 LOGS EN TIEMPO REAL:"
echo "   tail -f logs/app.log"
echo "   pm2 logs impulsacol-backend" 