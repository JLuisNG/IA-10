const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Kariokito12*',
  database: 'therapists_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ruta para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('API de Agencias funcionando!');
});

// Obtener todas las agencias
app.get('/api/agencias', async (req, res) => {
  try {
    console.log('Recibida solicitud GET a /api/agencias');
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name ASC');
    console.log(`Recuperadas ${rows.length} agencias de la base de datos`);
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
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});