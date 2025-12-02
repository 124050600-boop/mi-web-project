import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Permite: Railway domains, localhost, y sin origen
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      /\.railway\.app$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return origin === allowed;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Database connection for Railway
const getDbConfig = () => {
  if (process.env.MYSQLHOST) {
    console.log('📦 Using Railway MySQL configuration');
    return {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: 10
    };
  }
  
  // Fallback to local configuration
  console.log('🔧 Using local MySQL configuration');
  return {
    socketPath: '/tmp/mysql.sock',
    user: 'root',
    password: 'Pianoverde2012',
    database: 'sistema_educativo_queretaro',
    multipleStatements: true
  };
};

const pool = mysql.createPool(getDbConfig());
const promisePool = pool.promise();

// Query helper
const query = async (sql, params = []) => {
  try {
    const [results] = await promisePool.query(sql, params);
    return results;
  } catch (err) {
    console.error('❌ SQL Error:', err.message);
    console.error('Query:', sql);
    throw err;
  }
};

// Health check endpoint (required by Railway)
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'unimap-api'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// API Routes (copy ALL your existing routes here)
// ==============================================

// LOGIN
app.post('/api/login', async (req, res) => {
  const { role, identifier, password } = req.body;
  try {
    if (role === 'institution') {
      const sql = 'SELECT id_institucion, nombre, logo_url FROM instituciones WHERE usuario_admin = ? AND password_admin = ?';
      const results = await query(sql, [identifier, password]);
      if (results.length > 0) {
        res.json({ id: results[0].id_institucion, name: results[0].nombre, role: 'institution', avatar: results[0].logo_url });
      } else {
        res.status(401).json({ message: 'Usuario de institución o contraseña incorrectos.' });
      }
    } else {
      const sql = 'SELECT * FROM estudiantes WHERE email = ? AND password = ?';
      const results = await query(sql, [identifier, password]);
      if (results.length > 0) {
        const s = results[0];
        res.json({ id: s.id_estudiante, name: `${s.nombre} ${s.apellido}`, email: s.email, role: 'student', avatar: s.avatar_url, telefono: s.telefono });
      } else {
        res.status(401).json({ message: 'Correo de estudiante o contraseña incorrectos.' });
      }
    }
  } catch (err) { 
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// [COPY ALL YOUR OTHER ROUTES EXACTLY AS YOU HAVE THEM]
// app.post('/api/register', ...)
// app.get('/api/instituciones', ...)
// etc...

// ==============================================

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
