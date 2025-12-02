import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Configurar CORS para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://tu-app.railway.app'] 
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));

// Para servir archivos estáticos del frontend en producción
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONEXIÓN SQL - Usar variables de entorno en producción
const dbConfig = process.env.NODE_ENV === 'production' ? {
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'Pianoverde2012',
  database: process.env.MYSQLDATABASE || 'sistema_educativo_queretaro',
  multipleStatements: true
} : {
  socketPath: '/tmp/mysql.sock', 
  user: 'root',
  password: 'Pianoverde2012', 
  database: 'sistema_educativo_queretaro', 
  multipleStatements: true 
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error('❌ ERROR SQL:', err.message);
    // Reintentar conexión después de 5 segundos
    setTimeout(() => db.connect(), 5000);
  } else {
    console.log('✅ BASE DE DATOS CONECTADA');
  }
});

// Manejo de errores de conexión
db.on('error', (err) => {
  console.error('❌ Error de base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconectando a la base de datos...');
    db.connect();
  }
});

// --- HELPER PARA CONSULTAS ---
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Error en consulta SQL:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta de salud para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API del Sistema Educativo de Querétaro',
    status: 'online',
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- LOGIN STRICTO ---
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
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// [Mantén todas tus otras rutas igual que las tienes...]
// Solo agrega el manejo de errores global al final

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Para SPA (Single Page Application)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Configurar puerto para Railway
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 SERVIDOR CORRIENDO EN http://${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
