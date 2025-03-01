const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
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
    res.status(500).json({ message: 'Error al obtener agencias', error: error.message });
  }
});

// Obtener una agencia por su ID
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
  const { name, email, address, phone, status, docs, logo } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO agencias (name, email, address, phone, status, docs, logo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, address || 'Los Angeles, California', phone, status || 'Activo', docs || 'No', logo || '/api/placeholder/64/64']
    );
    
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear la agencia:', error);
    res.status(500).json({ message: 'Error al crear la agencia', error: error.message });
  }
});

// Actualizar una agencia existente
router.put('/:id', async (req, res) => {
  const { name, email, address, phone, status, docs, logo } = req.body;
  
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
    
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error('Error al actualizar la agencia:', error);
    res.status(500).json({ message: 'Error al actualizar la agencia', error: error.message });
  }
});

// Eliminar una agencia
router.delete('/:id', async (req, res) => {
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

module.exports = router;