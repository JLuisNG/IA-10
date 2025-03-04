const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 3003;

// Middleware
app.use(cors({
  origin: '*',  // En producción, limitar a los orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'therapists_db',
};

// Pool de conexiones a la base de datos
let pool;

async function initializeDbConnection() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Verificar conexión
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida correctamente');
    
    // Crear tablas si no existen
    await createTables(connection);
    
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

async function createTables(connection) {
  try {
    // Tabla de pacientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        requerimientos VARCHAR(255) NOT NULL,
        direccion VARCHAR(255),
        agencia_id INT NOT NULL,
        notas TEXT,
        link_correo VARCHAR(255) NOT NULL,
        estado ENUM('nuevo', 'asignado', 'therapy_sync', 'completado', 'no_asistido') DEFAULT 'nuevo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE
      )
    `);

    // Tabla de asignaciones de terapeutas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS asignaciones_terapeutas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paciente_id INT NOT NULL,
        terapeuta_nombre VARCHAR(255) NOT NULL,
        disciplina VARCHAR(50) NOT NULL,
        estado ENUM('pendiente', 'consultado', 'confirmado', 'rechazado') DEFAULT 'pendiente',
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
      )
    `);

    console.log('Tablas verificadas/creadas correctamente');
  } catch (error) {
    console.error('Error al crear tablas:', error);
    throw error;
  }
}

// Rutas API

// Obtener todas las agencias (redirigiendo a la API existente)
app.get('/api/agencias', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3002/api/agencias');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener agencias:', error);
    res.status(500).json({ error: 'Error al obtener agencias' });
  }
});

// Crear un nuevo paciente
app.post('/api/pacientes', async (req, res) => {
  const { nombre, requerimientos, direccion, agencia_id, notas, link_correo } = req.body;
  
  // Validar datos requeridos
  if (!nombre || !requerimientos || !agencia_id || !link_correo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Insertar paciente
    const [result] = await connection.query(
      'INSERT INTO pacientes (nombre, requerimientos, direccion, agencia_id, notas, link_correo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, requerimientos, direccion || null, agencia_id, notas || null, link_correo]
    );
    
    // Actualizar contador de pacientes en la agencia
    await fetch(`http://localhost:3002/api/agencias/incrementar-paciente/${agencia_id}`, {
      method: 'PUT'
    });
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      message: 'Paciente registrado correctamente'
    });
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    res.status(500).json({ error: 'Error al registrar paciente' });
  }
});

// Obtener todos los pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [pacientes] = await connection.query(`
      SELECT 
        p.*, 
        a.name AS agencia_nombre
      FROM 
        pacientes p
      JOIN 
        agencias a ON p.agencia_id = a.id
      ORDER BY 
        p.fecha_creacion DESC
    `);
    
    connection.release();
    
    res.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// Obtener un paciente por ID con sus asignaciones de terapeutas
app.get('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Obtener datos del paciente
    const [pacientes] = await connection.query(
      `SELECT 
        p.*, 
        a.name AS agencia_nombre
      FROM 
        pacientes p
      JOIN 
        agencias a ON p.agencia_id = a.id
      WHERE 
        p.id = ?`,
      [id]
    );
    
    if (pacientes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    const paciente = pacientes[0];
    
    // Obtener asignaciones de terapeutas
    const [asignaciones] = await connection.query(
      'SELECT * FROM asignaciones_terapeutas WHERE paciente_id = ?',
      [id]
    );
    
    paciente.terapeutas = asignaciones;
    
    connection.release();
    
    res.json(paciente);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
});

// Actualizar un paciente
app.put('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, requerimientos, direccion, agencia_id, notas, link_correo, estado } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // Verificar que el paciente existe
    const [pacientes] = await connection.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    
    if (pacientes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Actualizar paciente
    await connection.query(
      `UPDATE pacientes 
       SET nombre = ?, requerimientos = ?, direccion = ?, agencia_id = ?, notas = ?, link_correo = ?, estado = ? 
       WHERE id = ?`,
      [nombre, requerimientos, direccion || null, agencia_id, notas || null, link_correo, estado, id]
    );
    
    connection.release();
    
    res.json({ message: 'Paciente actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

// Asignar terapeuta a paciente
app.post('/api/pacientes/:id/asignar-terapeuta', async (req, res) => {
  const { id } = req.params;
  const { terapeuta_nombre, disciplina } = req.body;
  
  if (!terapeuta_nombre || !disciplina) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Verificar que el paciente existe
    const [pacientes] = await connection.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    
    if (pacientes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Insertar asignación
    await connection.query(
      'INSERT INTO asignaciones_terapeutas (paciente_id, terapeuta_nombre, disciplina) VALUES (?, ?, ?)',
      [id, terapeuta_nombre, disciplina]
    );
    
    // Actualizar estado del paciente si aún está en 'nuevo'
    const paciente = pacientes[0];
    if (paciente.estado === 'nuevo') {
      await connection.query(
        'UPDATE pacientes SET estado = ? WHERE id = ?',
        ['asignado', id]
      );
    }
    
    connection.release();
    
    res.status(201).json({ message: 'Terapeuta asignado correctamente' });
  } catch (error) {
    console.error('Error al asignar terapeuta:', error);
    res.status(500).json({ error: 'Error al asignar terapeuta' });
  }
});

// Actualizar estado de asignación de terapeuta
app.put('/api/asignaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({ error: 'Estado requerido' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Actualizar estado de la asignación
    await connection.query(
      'UPDATE asignaciones_terapeutas SET estado = ? WHERE id = ?',
      [estado, id]
    );
    
    connection.release();
    
    res.json({ message: 'Estado de asignación actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado de asignación:', error);
    res.status(500).json({ error: 'Error al actualizar estado de asignación' });
  }
});

// Inicializar la conexión a la base de datos y el servidor
async function startServer() {
  await initializeDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();