const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 3004;

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
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Rutas API

// Obtener todos los pacientes con información detallada
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
    
    // Para cada paciente, obtener sus asignaciones de terapeutas
    for (let i = 0; i < pacientes.length; i++) {
      const [asignaciones] = await connection.query(
        'SELECT * FROM asignaciones_terapeutas WHERE paciente_id = ?',
        [pacientes[i].id]
      );
      pacientes[i].terapeutas = asignaciones;
    }
    
    connection.release();
    
    res.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// Obtener un paciente por ID con todas sus asignaciones
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

// Actualizar estado de un paciente
app.put('/api/pacientes/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({ error: 'Estado requerido' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    // Verificar que el paciente existe
    const [pacientes] = await connection.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    
    if (pacientes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Actualizar estado
    await connection.query(
      'UPDATE pacientes SET estado = ? WHERE id = ?',
      [estado, id]
    );
    
    connection.release();
    
    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Actualizar datos completos de un paciente
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

// Agregar o actualizar asignación de terapeuta
app.post('/api/pacientes/:id/terapeutas', async (req, res) => {
  const { id } = req.params;
  const { terapeuta_nombre, disciplina, estado } = req.body;
  
  if (!terapeuta_nombre || !disciplina || !estado) {
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
    
    // Verificar si ya existe una asignación para esta disciplina
    const [asignaciones] = await connection.query(
      'SELECT * FROM asignaciones_terapeutas WHERE paciente_id = ? AND disciplina = ?',
      [id, disciplina]
    );
    
    if (asignaciones.length > 0) {
      // Actualizar asignación existente
      await connection.query(
        'UPDATE asignaciones_terapeutas SET terapeuta_nombre = ?, estado = ? WHERE id = ?',
        [terapeuta_nombre, estado, asignaciones[0].id]
      );
    } else {
      // Crear nueva asignación
      await connection.query(
        'INSERT INTO asignaciones_terapeutas (paciente_id, terapeuta_nombre, disciplina, estado) VALUES (?, ?, ?, ?)',
        [id, terapeuta_nombre, disciplina, estado]
      );
    }
    
    // Actualizar estado del paciente si todas las asignaciones están confirmadas
    const [todasAsignaciones] = await connection.query(
      'SELECT * FROM asignaciones_terapeutas WHERE paciente_id = ?',
      [id]
    );
    
    const todasConfirmadas = todasAsignaciones.every(asig => asig.estado === 'confirmado');
    
    if (todasConfirmadas && todasAsignaciones.length > 0) {
      await connection.query(
        'UPDATE pacientes SET estado = ? WHERE id = ?',
        ['asignado', id]
      );
    }
    
    connection.release();
    
    res.status(200).json({ message: 'Terapeuta asignado/actualizado correctamente' });
  } catch (error) {
    console.error('Error al asignar/actualizar terapeuta:', error);
    res.status(500).json({ error: 'Error al asignar/actualizar terapeuta' });
  }
});

// Eliminar asignación de terapeuta
app.delete('/api/asignaciones/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Verificar que la asignación existe
    const [asignaciones] = await connection.query('SELECT * FROM asignaciones_terapeutas WHERE id = ?', [id]);
    
    if (asignaciones.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    // Eliminar asignación
    await connection.query('DELETE FROM asignaciones_terapeutas WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

// Obtener plantillas de correos predefinidas
app.get('/api/plantillas-correo', (req, res) => {
  const plantillas = [
    {
      id: 1,
      nombre: 'Solo virtual disponible',
      asunto: 'Referral Update - Virtual Service Available',
      cuerpo: 'Hello,\n\nWe only have a PTA available in the area. No PT available to do in person evaluation, apologies!\n\nThank you for the referral anyways, if a virtual evaluation is of any help, please let us know.'
    },
    {
      id: 2,
      nombre: 'Servicio parcial disponible',
      asunto: 'Referral Update - Partial Service Available',
      cuerpo: 'Good afternoon,\n\nWe have found a PT who can help us with this referral. We will proceed to schedule an initial visit, thank you once again for the referral!\n\nUnfortunately we do not have an OT in the area at the moment.'
    },
    {
      id: 3,
      nombre: 'Esperando confirmación',
      asunto: 'Referral Update - Partial Confirmation',
      cuerpo: 'Good afternoon,\n\nWe have found a PT who can help us with this referral. We will proceed to schedule an initial visit, thank you once again for the referral!\n\nHowever we are still waiting for confirmation from our OT.'
    },
    {
      id: 4,
      nombre: 'Documentos faltantes',
      asunto: 'Referral Update - Additional Documentation Needed',
      cuerpo: 'Kindly share the patient\'s past medical history, hospital report, or any pertinent medical background so that our therapist can conduct the evaluation appropriately. Thank you.'
    },
    {
      id: 5,
      nombre: 'Aceptado pero sin fecha',
      asunto: 'Referral Update - Case Accepted',
      cuerpo: 'Hello team, Yes we can accept the case. Just waiting on a confirmed date from therapist.'
    }
  ];
  
  res.json(plantillas);
});

// Inicializar la conexión a la base de datos y el servidor
async function startServer() {
  await initializeDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();