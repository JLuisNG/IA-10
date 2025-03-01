const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para manejar los logos en base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    // Verificar conexión
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL establecida correctamente');
    
    // Crear tabla de terapeutas si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        areas TEXT,
        languages TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de agencias si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agencias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(255) DEFAULT 'Los Angeles, California',
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Activo',
        docs VARCHAR(50) DEFAULT 'No',
        logo TEXT,
        patients INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tablas verificadas/creadas');
    
    // Verificar si la tabla de agencias está vacía
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM agencias');
    
    if (rows[0].count === 0) {
      // Cargar datos predefinidos de agencias
      console.log('Cargando agencias predefinidas...');
      await loadPredefinedAgencies();
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Cargar datos predefinidos de agencias
const loadPredefinedAgencies = async () => {
  // Lista de agencias predefinidas
  const predefinedAgencies = [
    "24/7", "247hhs", "Able Hands", "Able Hands HH", "Access", "Access HH", "ACE HH", "Ace Home Health",
    "ADK HH", "Advent Cares", "Advent HH", "Agape HH", "Agapeheart HH", "Alaphia", "All American Choice",
    "All American Choise", "All Citizens HH", "All Linked", "All Linked HH", "Alliant HH", "Alpha HH",
    "Amax", "AMAX", "Ambient Hospice", "American Empire", "American N", "American Nursing", "Americare",
    "Americare HH", "Angelus HH", "ASOC", "Assistive Hospice", "Assistive Hospice And Palliative Care",
    "Axis", "Axis HH", "Azuria HH", "Azure", "Benevolent HH", "Benevolent HHA", "Best In Town HH",
    "Beverly Healing Home Care Inc", "Bright HH", "Bright Home Health", "Bright Horizons", "Care Sharing HH",
    "CAREPOINTE HH", "Caring Like Family HH"
    // Agrega más agencias según necesites
  ];
  
  // Función para generar teléfono aleatorio
  const generateRandomPhone = () => {
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(213) ${prefix}-${line}`;
  };
  
  // Función para generar email
  const generateEmail = (name) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return `contact@${cleanName}.com`;
  };
  
  try {
    // Crear consulta con múltiples inserciones
    const values = predefinedAgencies.map(name => [
      name,
      generateEmail(name),
      'Los Angeles, California',
      generateRandomPhone(),
      'Activo',
      'No',
      '/api/placeholder/64/64',
      0
    ]);
    
    await pool.query(`
      INSERT INTO agencias 
      (name, email, address, phone, status, docs, logo, patients) 
      VALUES ?
    `, [values]);
    
    console.log(`${predefinedAgencies.length} agencias predefinidas cargadas correctamente`);
  } catch (error) {
    console.error('Error al cargar agencias predefinidas:', error);
    throw error;
  }
};

// Inicializar la base de datos
initDatabase().catch(err => {
  console.error('Error grave al inicializar la base de datos:', err);
  process.exit(1);
});

// ======= RUTAS DE TERAPEUTAS =======
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

// En server.js - agrega esto justo antes de la ruta get de agencias
app.get('/api/test-agencias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias');
    console.log('Datos de agencias encontrados:', rows.length);
    res.json({
      success: true,
      count: rows.length,
      message: 'Prueba de conexión a la tabla agencias exitosa',
      sample: rows.slice(0, 3) // Muestra solo las primeras 3 agencias
    });
  } catch (error) {
    console.error('Error en prueba de agencias:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en la conexión a la tabla agencias',
      error: error.message
    });
  }
});


app.get('/api/test', (req, res) => {
  res.json({ message: "API funcionando correctamente", timestamp: new Date() });
});


// ======= RUTAS DE AGENCIAS =======
// Ruta para obtener todas las agencias
// En server.js
app.get('/api/agencias', async (req, res) => {
  try {
    // Explícitamente establecer el tipo de contenido a JSON
    res.setHeader('Content-Type', 'application/json');
    
    const [rows] = await pool.query('SELECT * FROM agencias ORDER BY name');
    
    // Utilizar JSON.stringify para asegurarse de que se envía como JSON
    res.send(JSON.stringify(rows));
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener las agencias', 
      error: error.message 
    });
  }
});

// Ruta para obtener una agencia por ID
app.get('/api/agencias/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
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

// Ruta para crear una nueva agencia
app.post('/api/agencias', async (req, res) => {
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
    const [result] = await pool.query(
      'INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, address, phone, status, docs, logo, patients || 0]
    );
    
    const [newAgency] = await pool.query('SELECT * FROM agencias WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newAgency[0]);
  } catch (error) {
    console.error('Error al crear agencia:', error);
    res.status(500).json({ 
      message: 'Error al crear la agencia', 
      error: error.message 
    });
  }
});

// Ruta para actualizar una agencia
app.put('/api/agencias/:id', async (req, res) => {
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
    const [checkRows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    // Actualizar la agencia
    await pool.query(
      'UPDATE agencias SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, patients = ? WHERE id = ?',
      [name, email, address, phone, status, docs, logo, patients, req.params.id]
    );
    
    // Obtener los datos actualizados
    const [updatedAgency] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    res.json(updatedAgency[0]);
  } catch (error) {
    console.error('Error al actualizar agencia:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la agencia', 
      error: error.message 
    });
  }
});

// Ruta para eliminar una agencia
app.delete('/api/agencias/:id', async (req, res) => {
  try {
    // Verificar que la agencia existe
    const [checkRows] = await pool.query('SELECT * FROM agencias WHERE id = ?', [req.params.id]);
    
    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'Agencia no encontrada' });
    }
    
    // Eliminar la agencia
    await pool.query('DELETE FROM agencias WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Agencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar agencia:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la agencia', 
      error: error.message 
    });
  }
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}



// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app; // Para testing