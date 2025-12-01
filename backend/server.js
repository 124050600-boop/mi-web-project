import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// CONEXIÓN SQL
const db = mysql.createConnection({
  socketPath: '/tmp/mysql.sock', 
  user: 'root',
  password: 'Pianoverde2012', 
  database: 'sistema_educativo_queretaro', 
  multipleStatements: true 
});

db.connect(err => {
  if (err) console.error('❌ ERROR SQL:', err.message);
  else console.log('✅ BASE DE DATOS CONECTADA');
});

// --- HELPER PARA CONSULTAS ---
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// --- LOGIN STRICTO ---
app.post('/api/login', async (req, res) => {
    const { role, identifier, password } = req.body;
    try {
        if (role === 'institution') {
            // Verificar usuario_admin y password_admin
            const sql = 'SELECT id_institucion, nombre, logo_url FROM instituciones WHERE usuario_admin = ? AND password_admin = ?';
            const results = await query(sql, [identifier, password]);
            if (results.length > 0) {
                res.json({ id: results[0].id_institucion, name: results[0].nombre, role: 'institution', avatar: results[0].logo_url });
            } else {
                res.status(401).json({ message: 'Usuario de institución o contraseña incorrectos.' });
            }
        } else {
            // Verificar email y password en tabla estudiantes
            const sql = 'SELECT * FROM estudiantes WHERE email = ? AND password = ?';
            const results = await query(sql, [identifier, password]);
            if (results.length > 0) {
                const s = results[0];
                res.json({ id: s.id_estudiante, name: `${s.nombre} ${s.apellido}`, email: s.email, role: 'student', avatar: s.avatar_url, telefono: s.telefono });
            } else {
                res.status(401).json({ message: 'Correo de estudiante o contraseña incorrectos.' });
            }
        }
    } catch (err) { res.status(500).send(err); }
});

app.post('/api/register', async (req, res) => {
    const { nombre, apellido, email, password } = req.body;
    try {
        const result = await query('INSERT INTO estudiantes (nombre, apellido, email, password) VALUES (?, ?, ?, ?)', [nombre, apellido, email, password]);
        res.json({ id: result.insertId, name: `${nombre} ${apellido}`, email, role: 'student' });
    } catch (err) { res.status(500).send(err); }
});

app.put('/api/students/:id', async (req, res) => {
    const { nombre, apellido, telefono, avatarUrl } = req.body;
    try {
        await query(`UPDATE estudiantes SET nombre=?, apellido=?, telefono=?, avatar_url=? WHERE id_estudiante=?`, [nombre, apellido, telefono, avatarUrl, req.params.id]);
        const r = await query('SELECT * FROM estudiantes WHERE id_estudiante = ?', [req.params.id]);
        const s = r[0];
        res.json({ id: s.id_estudiante, name: `${s.nombre} ${s.apellido}`, email: s.email, role: 'student', avatar: s.avatar_url, telefono: s.telefono });
    } catch (err) { res.status(500).send(err); }
});

// --- INSTITUCIONES ---
app.get('/api/instituciones', async (req, res) => {
  const sql = `SELECT i.*, t.nombre as tipo, COALESCE(AVG(r.calificacion), 0) as promedio_calificacion, COUNT(r.id_review) as total_reviews FROM instituciones i LEFT JOIN tipos_institucion t ON i.id_tipo = t.id_tipo LEFT JOIN reviews r ON i.id_institucion = r.id_institucion GROUP BY i.id_institucion`;
  try { res.json(await query(sql) || []); } catch (err) { res.status(500).send(err); }
});

app.get('/api/instituciones/:id', async (req, res) => {
    try {
        const r = await query(`SELECT i.*, t.nombre as tipo FROM instituciones i LEFT JOIN tipos_institucion t ON i.id_tipo = t.id_tipo WHERE i.id_institucion = ?`, [req.params.id]);
        if (!r || r.length === 0) return res.status(404).json({ message: 'No encontrada' });
        res.json(r[0]);
    } catch (err) { res.status(500).send(err); }
});

app.put('/api/instituciones/:id', async (req, res) => {
    const { nombre, descripcion, telefono, www, bannerUrl, logoUrl } = req.body;
    try {
        await query(`UPDATE instituciones SET nombre=?, descripcion=?, telefono=?, sitio_web=?, banner_url=?, logo_url=? WHERE id_institucion=?`, 
        [nombre || null, descripcion || null, telefono || null, www || null, bannerUrl || null, logoUrl || null, req.params.id]);
        const r = await query('SELECT * FROM instituciones WHERE id_institucion = ?', [req.params.id]);
        res.json(r[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- GALERIA ---
app.get('/api/galeria', async (req, res) => {
    try {
        const results = await query('SELECT * FROM galeria_institucion WHERE id_institucion = ?', [req.query.institucion]);
        res.json(results || []);
    } catch (err) { res.status(500).send(err); }
});

app.post('/api/galeria', async (req, res) => {
    const { id_institucion, imagenUrl, descripcion } = req.body;
    try {
        const result = await query('INSERT INTO galeria_institucion (id_institucion, imagen_url, descripcion) VALUES (?, ?, ?)', [id_institucion, imagenUrl, descripcion]);
        res.json({ id_imagen: result.insertId, id_institucion, imagenUrl, descripcion });
    } catch (err) { res.status(500).send(err); }
});

app.delete('/api/galeria/:id', async (req, res) => {
    try {
        await query('DELETE FROM galeria_institucion WHERE id_imagen = ?', [req.params.id]);
        res.json({ message: "Eliminada" });
    } catch (err) { res.status(500).send(err); }
});

// --- OFERTAS ---
app.get('/api/ofertas', async (req, res) => {
  let sql = `
    SELECT o.id_oferta, i.nombre as inst_nombre, i.id_institucion, i.logo_url, i.color_hex, i.siglas,
           e.latitud, e.longitud, t.nombre as inst_tipo, e.id_escuela,
           c.nombre as carrera_nombre, c.clave as carrera_clave, n.nombre as nivel_nombre,
           m.nombre as modalidad_nombre, mun.nombre as municipio_nombre, e.nombre as escuela_nombre, o.duracion,
           camp.nombre as campo_nombre, camp.id_campo, c.id_info
    FROM ofertas o
    JOIN instituciones i ON o.id_institucion = i.id_institucion
    LEFT JOIN tipos_institucion t ON i.id_tipo = t.id_tipo
    JOIN escuelas e ON o.id_escuela = e.id_escuela
    JOIN municipios mun ON e.id_municipio = mun.id_municipio
    JOIN carreras c ON o.id_carrera = c.id_carrera
    LEFT JOIN campos_formacion camp ON c.id_campo = camp.id_campo
    JOIN niveles n ON o.id_nivel = n.id_nivel
    JOIN modalidades m ON o.id_modalidad = m.id_modalidad
  `;
  if (req.query.institucion) sql += ` WHERE i.id_institucion = ${mysql.escape(req.query.institucion)}`;
  
  try {
      const results = await query(sql);
      const formatted = (results || []).map(r => ({
        id_oferta: r.id_oferta, inst_id: r.id_institucion,
        institucion: { id_institucion: r.id_institucion, nombre: r.inst_nombre, tipo: r.inst_tipo, logoUrl: r.logo_url, color: r.color_hex, siglas: r.siglas },
        escuela: { id_escuela: r.id_escuela, nombre: r.escuela_nombre, latitud: r.latitud, longitud: r.longitud },
        carrera: { nombre: r.carrera_nombre, clave: r.carrera_clave, id_info: r.id_info },
        nivel: { nombre: r.nivel_nombre }, modalidad: { nombre: r.modalidad_nombre },
        municipio: { nombre: r.municipio_nombre },
        campo: { id_campo: r.id_campo, nombre: r.campo_nombre }, duracion: r.duracion
      }));
      res.json(formatted);
  } catch (err) { res.status(500).send(err); }
});

app.get('/api/ofertas/:id/detalles', async (req, res) => {
    try {
        const results = await query('SELECT * FROM detalles_ofertas WHERE id_oferta = ?', [req.params.id]);
        res.json(results && results.length > 0 ? results[0] : null);
    } catch (err) { res.status(500).send(err); }
});

app.put('/api/ofertas/:id/detalles', async (req, res) => {
    const { mapaCurricularUrl, perfilIngreso, perfilEgreso, campoLaboral, habilidades } = req.body;
    try {
        const results = await query('SELECT * FROM detalles_ofertas WHERE id_oferta = ?', [req.params.id]);
        if (results.length > 0) {
            await query(`UPDATE detalles_ofertas SET mapa_curricular_url=?, perfil_ingreso=?, perfil_egreso=?, campo_laboral=?, habilidades=? WHERE id_oferta=?`, 
            [mapaCurricularUrl, perfilIngreso, perfilEgreso, campoLaboral, habilidades, req.params.id]);
            res.json({ message: "Actualizado" });
        } else {
            await query(`INSERT INTO detalles_ofertas (id_oferta, mapa_curricular_url, perfil_ingreso, perfil_egreso, campo_laboral, habilidades) VALUES (?,?,?,?,?,?)`, 
            [req.params.id, mapaCurricularUrl, perfilIngreso, perfilEgreso, campoLaboral, habilidades]);
            res.json({ message: "Creado" });
        }
    } catch (e) { res.status(500).send(e); }
});

app.post('/api/ofertas', async (req, res) => {
    const { id_institucion, id_escuela, id_carrera, id_nivel, id_modalidad, duracion } = req.body;
    try {
        const result = await query(`INSERT INTO ofertas (id_institucion, id_escuela, id_carrera, id_nivel, id_modalidad, duracion) VALUES (?,?,?,?,?,?)`, 
        [id_institucion, id_escuela, id_carrera, id_nivel, id_modalidad, duracion]);
        res.json({ message: "Agregada", id: result.insertId });
    } catch (err) { res.status(500).send(err); }
});

app.delete('/api/ofertas/:id', async (req, res) => {
    try {
        await query('DELETE FROM ofertas WHERE id_oferta = ?', [req.params.id]);
        res.json({ message: "Eliminada" });
    } catch (err) { res.status(500).send(err); }
});

// --- CARRERAS (NEW) ---
app.post('/api/carreras', async (req, res) => {
    const { nombre, clave, id_campo } = req.body;
    try {
        const result = await query('INSERT INTO carreras (nombre, clave, id_campo) VALUES (?, ?, ?)', [nombre, clave, id_campo]);
        res.json({ id_carrera: result.insertId, nombre, clave, id_campo });
    } catch (err) { res.status(500).send(err); }
});

// --- ESCUELAS / CAMPUS (CON MUNICIPIO) ---
app.get('/api/escuelas', async (req, res) => { 
    let sql = `
        SELECT e.id_escuela, e.id_institucion, e.nombre, e.latitud, e.longitud,
               i.nombre as inst_nombre, i.siglas, i.logo_url, i.color_hex, t.nombre as tipo, i.banner_url,
               COALESCE(AVG(r.calificacion), 0) as promedio_calificacion,
               mun.nombre as municipio_nombre
        FROM escuelas e
        JOIN instituciones i ON e.id_institucion = i.id_institucion
        LEFT JOIN tipos_institucion t ON i.id_tipo = t.id_tipo
        LEFT JOIN reviews r ON i.id_institucion = r.id_institucion
        LEFT JOIN municipios mun ON e.id_municipio = mun.id_municipio
    `;
    const params = [];
    if(req.query.institucion) {
        sql += ` WHERE e.id_institucion = ?`;
        params.push(req.query.institucion);
    }
    sql += ` GROUP BY e.id_escuela`;

    try { 
        const results = await query(sql, params); 
        console.log(`[DEBUG] Escuelas encontradas: ${results.length}`);
        res.json(results || []); 
    } catch(e){ 
        console.error("Error fetching escuelas", e);
        res.status(500).send(e); 
    }
});

// --- CREATE CAMPUS (NEW) ---
app.post('/api/escuelas', async (req, res) => {
    const { id_institucion, id_municipio, nombre, latitud, longitud } = req.body;
    try {
        const result = await query('INSERT INTO escuelas (id_institucion, id_municipio, nombre, latitud, longitud) VALUES (?, ?, ?, ?, ?)', 
        [id_institucion, id_municipio, nombre, latitud, longitud]);
        res.json({ id_escuela: result.insertId, ...req.body });
    } catch (err) { res.status(500).send(err); }
});

// --- INFO CARRERAS ---
app.get('/api/info-carreras', async (req, res) => {
    try {
        const results = await query('SELECT * FROM info_carreras');
        res.json(results || []);
    } catch (err) { res.status(500).send(err); }
});

// --- CATALOGOS ---
app.get('/api/municipios', async (req, res) => { try { res.json(await query('SELECT * FROM municipios') || []); } catch(e){res.json([])} });
app.get('/api/niveles', async (req, res) => { try { res.json(await query('SELECT * FROM niveles') || []); } catch(e){res.json([])} });
app.get('/api/campos', async (req, res) => { try { res.json(await query('SELECT * FROM campos_formacion') || []); } catch(e){res.json([])} });
app.get('/api/modalidades', async (req, res) => { try { res.json(await query('SELECT * FROM modalidades') || []); } catch(e){res.json([])} });
app.get('/api/carreras', async (req, res) => { try { res.json(await query('SELECT * FROM carreras ORDER BY nombre') || []); } catch(e){res.json([])} });

// --- EXTRAS ---
app.post('/api/reviews', async (req, res) => {
    const { id_institucion, nombre_usuario, calificacion, comentario } = req.body;
    try {
        const result = await query('INSERT INTO reviews (id_institucion, nombre_usuario, calificacion, comentario) VALUES (?, ?, ?, ?)', [id_institucion, nombre_usuario, calificacion, comentario]);
        res.json({ id_review: result.insertId, ...req.body, fecha: new Date() });
    } catch (err) { res.status(500).send(err); }
});
app.get('/api/reviews', async (req, res) => {
    try { res.json(await query('SELECT * FROM reviews WHERE id_institucion = ? ORDER BY fecha DESC', [req.query.institucion]) || []); } catch(e){res.json([])}
});
app.get('/api/convocatorias', async (req, res) => {
    try { res.json(await query('SELECT id_convocatoria, id_institucion, titulo, contenido, fecha, imagen_url as imagenUrl FROM convocatorias WHERE id_institucion = ? ORDER BY fecha DESC', [req.query.institucion]) || []); } catch(e){res.json([])}
});
app.post('/api/convocatorias', async (req, res) => {
    const { id_institucion, titulo, contenido, imagenUrl } = req.body;
    try {
        const resu = await query('INSERT INTO convocatorias (id_institucion, titulo, contenido, imagen_url) VALUES (?, ?, ?, ?)', [id_institucion, titulo, contenido, imagenUrl || null]);
        res.json({ id_convocatoria: resu.insertId, ...req.body, fecha: new Date()});
    } catch (err) { res.status(500).send(err); }
});

app.listen(3000, () => console.log('🚀 SERVIDOR CORRIENDO EN PUERTO 3000'));