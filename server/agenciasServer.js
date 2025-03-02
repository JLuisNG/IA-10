const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.AGENCIES_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kariokito12*',
  database: process.env.DB_NAME || 'therapists_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ 
    error: 'Error en el servidor', 
    message: err.message 
  });
});

// Ruta para obtener todas las agencias
app.get('/api/agencias', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Ruta para obtener una agencia específica
app.get('/api/agencias/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// Ruta para buscar agencias por nombre
app.get('/api/agencias/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM agencias WHERE name LIKE ? ORDER BY name ASC',
      [`%${query}%`]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Ruta para crear una nueva agencia
app.post('/api/agencias', async (req, res, next) => {
  const { name, email, address, phone, status, docs, logo, patients } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre de la agencia es obligatorio' });
  }
  
  try {
    // Generar valores por defecto para campos opcionales
    const defaultAddress = address || 'Los Angeles, California';
    const defaultStatus = status || 'Activo';
    const defaultDocs = docs || 'No';
    const defaultLogo = logo || '/api/placeholder/64/64';
    const defaultPatients = patients || 0;
    
    const [result] = await pool.query(
      `INSERT INTO agencias 
       (name, email, address, phone, status, docs, logo, patients) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, defaultAddress, phone, defaultStatus, defaultDocs, defaultLogo, defaultPatients]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      email, 
      address: defaultAddress, 
      phone, 
      status: defaultStatus, 
      docs: defaultDocs,
      logo: defaultLogo,
      patients: defaultPatients,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Ruta para actualizar una agencia
app.put('/api/agencias/:id', async (req, res, next) => {
  const { name, email, address, phone, status, docs, logo, patients } = req.body;
  const { id } = req.params;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre de la agencia es obligatorio' });
  }
  
  try {
    const [result] = await pool.query(
      `UPDATE agencias 
       SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, patients = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, email, address, phone, status, docs, logo, patients, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    
    // Obtener los datos actualizados
    const [updated] = await pool.query('SELECT * FROM agencias WHERE id = ?', [id]);
    
    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Ruta para eliminar una agencia
app.delete('/api/agencias/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM agencias WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    
    res.json({ message: 'Agencia eliminada correctamente', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de Agencias corriendo en el puerto ${PORT}`);
});