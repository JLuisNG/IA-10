const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// NUEVAS RUTAS PARA AGENCIAS
// Obtener todas las agencias
app.get('/api/agencias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Buscar agencias por nombre
app.get('/api/agencias/search', async (req, res) => {
  const searchTerm = req.query.term || '';
  
  try {
    const [rows] = await pool.query(
      'SELECT * FROM agencias WHERE name LIKE ? ORDER BY name ASC', 
      [`%${searchTerm}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar agencias:', error);
    res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

// Obtener una agencia específica
app.get('/api/agencias/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener agencia:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Crear una nueva agencia
app.post('/api/agencias', async (req, res) => {
  const { name, email, address, phone, status, docs, logo, patients } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre de la agencia es obligatorio' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, address || 'Los Angeles, California', phone, status || 'Activo', docs || 'No', logo || '/api/placeholder/64/64', patients || 0]
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
      patients: patients || 0
    });
  } catch (error) {
    console.error('Error al crear agencia:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
});

// Actualizar una agencia
app.put('/api/agencias/:id', async (req, res) => {
  const { name, email, address, phone, status, docs, logo, patients } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre de la agencia es obligatorio' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE agencias SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, patients = ? WHERE id = ?',
      [name, email, address, phone, status, docs, logo, patients, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    
    res.json({ 
      id: parseInt(req.params.id), 
      name, 
      email, 
      address, 
      phone, 
      status, 
      docs,
      logo,
      patients
    });
  } catch (error) {
    console.error('Error al actualizar agencia:', error);
    res.status(500).json({ error: 'Error al actualizar los datos' });
  }
});

// Eliminar una agencia
app.delete('/api/agencias/:id', async (req, res) => {
  try {
    // Simulamos un retraso para mostrar la animación de carga en el frontend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const [result] = await pool.query('DELETE FROM agencias WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    
    res.json({ message: 'Agencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar agencia:', error);
    res.status(500).json({ error: 'Error al eliminar los datos' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});