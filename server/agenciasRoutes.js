const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// Obtener todas las agencias
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Buscar agencias por nombre
router.get('/search', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;