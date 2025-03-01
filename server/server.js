const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'therapists_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ================ RUTAS DE TERAPEUTAS ================
// Ruta para obtener todos los terapeutas

app.get('/api/therapists', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapists');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener terapeutas:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Ruta para obtener un terapeuta específico
app.get('/api/therapists/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapists WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Terapeuta no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener terapeuta:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Ruta para crear un nuevo terapeuta
app.post('/api/therapists', async (req, res) => {
  const { name, type, category, areas, languages, phone, email, status } = req.body;
  
  if (!name || !type || !category) {
    return res.status(400).json({ error: 'Los campos nombre, tipo y categoría son obligatorios' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO therapists (name, type, category, areas, languages, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, category, areas, languages, phone, email, status]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      type, 
      category, 
      areas, 
      languages, 
      phone, 
      email, 
      status 
    });
  } catch (error) {
    console.error('Error al crear terapeuta:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
});

// Ruta para actualizar un terapeuta
app.put('/api/therapists/:id', async (req, res) => {
  const { name, type, category, areas, languages, phone, email, status } = req.body;
  
  if (!name || !type || !category) {
    return res.status(400).json({ error: 'Los campos nombre, tipo y categoría son obligatorios' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE therapists SET name = ?, type = ?, category = ?, areas = ?, languages = ?, phone = ?, email = ?, status = ? WHERE id = ?',
      [name, type, category, areas, languages, phone, email, status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Terapeuta no encontrado' });
    }
    
    res.json({ 
      id: req.params.id, 
      name, 
      type, 
      category, 
      areas, 
      languages, 
      phone, 
      email, 
      status 
    });
  } catch (error) {
    console.error('Error al actualizar terapeuta:', error);
    res.status(500).json({ error: 'Error al actualizar los datos' });
  }
});

// Ruta para eliminar un terapeuta
app.delete('/api/therapists/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM therapists WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Terapeuta no encontrado' });
    }
    
    res.json({ message: 'Terapeuta eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar terapeuta:', error);
    res.status(500).json({ error: 'Error al eliminar los datos' });
  }
});

// ================ RUTAS DE AGENCIAS ================
// Obtener todas las agencias
app.get('/api/agencies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ message: 'Error al obtener agencias', error: error.message });
  }
});

// Obtener una agencia por su ID
app.get('/api/agencies/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener la agencia:', error);
    res.status(500).json({ message: 'Error al obtener la agencia', error: error.message });
  }
});

// Crear una nueva agencia
app.post('/api/agencies', async (req, res) => {
  const { name, email, address, phone, status, docs, logo } = req.body;
  
  // Validar campos requeridos
  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, address || 'Los Angeles, California', phone, status || 'Activo', docs || 'No', logo || '/api/placeholder/64/64', 0]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      email, 
      address: address || 'Los Angeles, California', 
      phone, 
      status: status || 'Activo', 
      docs: docs || 'No', 
      logo: logo || '/api/placeholder/64/64',
      patients: 0
    });
  } catch (error) {
    console.error('Error al crear la agencia:', error);
    res.status(500).json({ message: 'Error al crear la agencia', error: error.message });
  }
});

// Actualizar una agencia existente
app.put('/api/agencies/:id', async (req, res) => {
  const { name, email, address, phone, status, docs, logo } = req.body;

  // Validar campos requeridos
  if (!name || !email) {
    return res.status(400).json({ message: 'Nombre y email son obligatorios' });
  }

  try {
    // Verificar si la agencia existe
    const [agencia] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (agencia.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }

    // Actualizar la agencia
    await pool.query(
      'UPDATE agencias SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, address, phone, status, docs, logo, req.params.id]
    );

    res.json({ 
      id: parseInt(req.params.id), 
      name, 
      email, 
      address, 
      phone, 
      status, 
      docs, 
      logo,
      patients: agencia[0].patients
    });
  } catch (error) {
    console.error('Error al actualizar la agencia:', error);
    res.status(500).json({ message: 'Error al actualizar la agencia', error: error.message });
  }
});

// Eliminar una agencia
app.delete('/api/agencies/:id', async (req, res) => {
  try {
    // Verificar si la agencia existe
    const [agencia] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (agencia.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    // Eliminar la agencia
    await pool.query('DELETE FROM agencias WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Agencia eliminada correctamente', id: parseInt(req.params.id) });
  } catch (error) {
    console.error('Error al eliminar la agencia:', error);
    res.status(500).json({ message: 'Error al eliminar la agencia', error: error.message });
  }
});

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Motive Homecare' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});