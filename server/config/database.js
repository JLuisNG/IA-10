const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear la conexión con la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'motive_homecare',
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
    console.log('Tabla de agencias verificada/creada');

    // Verificar si la tabla está vacía
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM agencias');
    
    if (rows[0].count === 0) {
      // Cargar datos predefinidos
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
    "Beverly Healing Home Care Inc", "Bright HH", "Bright Home Health", "Bright Horizons", "Care Sharing HH"
    // ... Añadir el resto de agencias según sea necesario
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

// Inicializar la base de datos al importar el módulo
initDatabase().catch(err => {
  console.error('Error grave al inicializar la base de datos:', err);
  process.exit(1);
});

module.exports = pool;