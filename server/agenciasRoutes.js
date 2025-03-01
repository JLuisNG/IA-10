const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las agencias
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agencias ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener las agencias', 
      error: error.message 
    });
  }
});

// Obtener una agencia por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener la agencia:', error);
    res.status(500).json({ 
      message: 'Error al obtener la agencia', 
      error: error.message 
    });
  }
});

// Crear una nueva agencia
router.post('/', async (req, res) => {
  const { 
    name, 
    email, 
    address, 
    phone, 
    status, 
    docs, 
    logo, 
    patients 
  } = req.body;
  
  // Validar campos requeridos
  if (!name || !email) {
    return res.status(400).json({ 
      message: 'El nombre y el correo electrónico son obligatorios' 
    });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, address, phone, status, docs, logo, patients || 0]
    );
    
    const [newAgency] = await db.query('SELECT * FROM agencias WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newAgency[0]);
  } catch (error) {
    console.error('Error al crear agencia:', error);
    res.status(500).json({ 
      message: 'Error al crear la agencia', 
      error: error.message 
    });
  }
});

// Actualizar una agencia
router.put('/:id', async (req, res) => {
  const { 
    name, 
    email, 
    address, 
    phone, 
    status, 
    docs, 
    logo, 
    patients 
  } = req.body;
  
  // Validar campos requeridos
  if (!name || !email) {
    return res.status(400).json({ 
      message: 'El nombre y el correo electrónico son obligatorios' 
    });
  }
  
  try {
    // Verificar que la agencia existe
    const [checkRows] = await db.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    // Actualizar la agencia
    await db.query(
      'UPDATE agencias SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, patients = ? WHERE id = ?',
      [name, email, address, phone, status, docs, logo, patients, req.params.id]
    );
    
    // Obtener los datos actualizados
    const [updatedAgency] = await db.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    res.json(updatedAgency[0]);
  } catch (error) {
    console.error('Error al actualizar agencia:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la agencia', 
      error: error.message 
    });
  }
});

// Eliminar una agencia
router.delete('/:id', async (req, res) => {
  try {
    // Verificar que la agencia existe
    const [checkRows] = await db.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    // Eliminar la agencia
    await db.query('DELETE FROM agencias WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Agencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar agencia:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la agencia', 
      error: error.message 
    });
  }
});

module.exports = router;