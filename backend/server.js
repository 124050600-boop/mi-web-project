import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configurar CORS dinámicamente
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir: Railway, localhost, y sin origen (postman, etc)
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      /\.railway\.app$/ // Cualquier dominio de Railway
    ];
    
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return origin === allowed;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    })) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Para servir archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONEXIÓN SQL - Configuración para Railway y local
const getDbConfig = () => {
  // Si Railway provee variables de MySQL, úsalas
  if (process.env.MYSQLHOST) {
    console.log('📦 Usando configuración de Railway MySQL');
    return {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined
    };
  }
  
  // Si hay DATABASE_URL (Railway PostgreSQL)
  if (process.env.DATABASE_URL) {
    console.log('📦 Usando DATABASE_URL de Railway');
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // Desarrollo local con socket (tu configuración original)
  console.log('🔧 Usando configuración local');
  return {
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'Pianoverde2012',
    database: 'sistema_educativo_queretaro',
    multipleStatements: true
  };
};

// Crear pool de conexiones
const pool = mysql.createPool(getDbConfig());

const promisePool = pool.promise();

// --- HELPER PARA CONSULTAS ---
const query = async (sql, params = []) => {
  try {
    const [results] = await promisePool.query(sql, params);
    return results;
  } catch (err) {
    console.error('❌ Error en consulta SQL:', err.message);
    console.error('SQL:', sql);
    throw err;
  }
};

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Ruta de salud para Railway
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a DB
    await query('SELECT 1 as status');
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema Educativo de Querétaro',
    version: '1.0.0',
    endpoints: {
      api: '/api/*',
      health: '/health',
      docs: 'Por implementar'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- TUS RUTAS EXISTENTES (MANTÉN TODAS IGUAL) ---
// Solo necesitas copiar y pegar todas tus rutas actuales aquí...

// 1. Login (ya lo tienes)
app.post('/api/login', async (req, res) => {
  // Tu código actual...
});

// 2. Registro
app.post('/api/register', async (req, res) => {
  // Tu código actual...
});

// 3. Instituciones
app.get('/api/instituciones', async (req, res) => {
  // Tu código actual...
});

// ... [Continúa con todas tus otras rutas exactamente como las tienes] ...

// IMPORTANTE: Después de todas tus rutas API, añade:

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  // Verificar si existe la carpeta dist
  import('fs').then(fs => {
    if (fs.existsSync(frontendPath)) {
      console.log('📁 Sirviendo frontend desde:', frontendPath);
      app.use(express.static(frontendPath));
      
      // Para SPA: todas las rutas no-API van al index.html
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(frontendPath, 'index.html'));
        }
      });
    } else {
      console.warn('⚠️  No se encontró frontend/dist. Solo se servirá API.');
    }
  }).catch(err => {
    console.error('Error cargando fs:', err);
  });
}

// Manejo de errores 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log(`🚀 SERVIDOR INICIADO`);
  console.log(`📍 URL: http://${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Puerto: ${PORT}`);
  console.log(`🗄️  DB Config: ${process.env.MYSQLHOST ? 'Railway' : 'Local'}`);
  console.log('='.repeat(50));
  
  // Mostrar rutas disponibles
  console.log('\n📡 Rutas disponibles:');
  console.log('  GET  /              - Información de la API');
  console.log('  GET  /health        - Estado del servidor');
  console.log('  POST /api/login     - Inicio de sesión');
  console.log('  POST /api/register  - Registro de estudiantes');
  console.log('  GET  /api/instituciones - Lista de instituciones');
  console.log('  ... y todas tus otras rutas');
});
