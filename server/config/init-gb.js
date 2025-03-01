const mysql = require('mysql2/promise');
const config = require('./db');

// Script para inicializar la base de datos
async function initializeDatabase() {
  let connection;
  
  try {
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password
    });
    
    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.database}`);
    await connection.query(`USE ${config.db.database}`);
    
    // Crear la tabla de agencias si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agencias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
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
    
    // Verificar si ya existen agencias
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM agencias');
    
    // Insertar datos de ejemplo solo si la tabla está vacía
    if (rows[0].count === 0) {
      console.log('Insertando datos de ejemplo en la tabla agencias...');
      
      const agenciasEjemplo = [
        { name: '24/7', email: 'contact@247.com', address: 'Los Angeles, California', phone: '(213) 555-1001', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 45 },
        { name: '247hhs', email: 'contact@247hhs.com', address: 'Los Angeles, California', phone: '(213) 555-1002', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 38 },
        { name: 'Able Hands', email: 'contact@ablehands.com', address: 'Los Angeles, California', phone: '(213) 555-1003', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 62 },
        { name: 'Access', email: 'contact@access.com', address: 'Los Angeles, California', phone: '(213) 555-1004', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 51 },
        { name: 'ACE HH', email: 'contact@acehh.com', address: 'Los Angeles, California', phone: '(213) 555-1005', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 73 },
        { name: 'Azuria HH', email: 'contact@azuriahh.com', address: 'Los Angeles, California', phone: '(213) 555-1006', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 29 },
        { name: 'Benevolent HH', email: 'contact@benevolenthh.com', address: 'Los Angeles, California', phone: '(213) 555-1007', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 47 },
        { name: 'Care Sharing HH', email: 'contact@caresharinghh.com', address: 'Los Angeles, California', phone: '(213) 555-1008', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 55 },
        { name: 'Divine Care HH', email: 'contact@divinecarehh.com', address: 'Los Angeles, California', phone: '(213) 555-1009', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 68 },
        { name: 'Elite Health', email: 'contact@elitehealth.com', address: 'Los Angeles, California', phone: '(213) 555-1010', status: 'Activo', docs: 'No', logo: '/api/placeholder/64/64', patients: 84 }
      ];
      
      // Utilizar una transacción para garantizar la integridad de los datos
      await connection.beginTransaction();
      
      for (const agencia of agenciasEjemplo) {
        await connection.query(
          'INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [agencia.name, agencia.email, agencia.address, agencia.phone, agencia.status, agencia.docs, agencia.logo, agencia.patients]
        );
      }
      
      await connection.commit();
      console.log('Datos de ejemplo insertados correctamente.');
    }
    
    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar la inicialización
initializeDatabase()
  .then(() => {
    console.log('Script de inicialización completado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en script de inicialización:', error);
    process.exit(1);
  });