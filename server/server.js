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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});