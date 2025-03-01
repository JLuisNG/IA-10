// server/populate-agencies.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Lista de todas las agencias predefinidas
const predefinedAgencies = [
    "24/7", "247hhs", "Able Hands", "Able Hands HH", "Access", "Access HH", "ACE HH", "Ace Home Health",
    "ADK HH", "Advent Cares", "Advent HH", "Agape HH", "Agapeheart HH", "Alaphia", "All American Choice",
    "All American Choise", "All Citizens HH", "All Linked", "All Linked HH", "Alliant HH", "Alpha HH",
    "Amax", "AMAX", "Ambient Hospice", "American Empire", "American N", "American Nursing", "Americare",
    "Americare HH", "Angelus HH", "ASOC", "Assistive Hospice", "Assistive Hospice And Palliative Care",
    "Axis", "Axis HH", "Azuria HH", "Azure", "Benevolent HH", "Benevolent HHA", "Best In Town HH",
    "Beverly Healing Home Care Inc", "Bright HH", "Bright Home Health", "Bright Horizons", "Care Sharing HH",
    "CAREPOINTE HH", "Caring Like Family HH", "Carson Healthcare", "Caritas HH", "Changing Lives", "CHCS",
    "Chelsea HH", "COHEN", "Comprehensive", "Continuity", "Core at Home", "Core PT", "Cosmopolitan",
    "curing hands HH", "Destiny", "DicniTonic HH", "DigniTonic", "Dignitonic", "Direct Care", "Direct Care HH",
    "Distinctive", "Distinctive HH", "Divine", "Divine Care HH", "Divine Pearl HH", "DSP", "DSP HH",
    "Easy Choice HH", "Ed & Ar Hospice", "Ed & Ar Hospice Care", "ELITE HEALTH CAREA", "Elite Health",
    "Elite HH", "Equanimity", "Equanimity HH", "Equan HH", "ER", "ER HH", "Excellence", "Family First Home",
    "Fast Doc HH", "Firts Choice HH", "First Choice HH", "Forever", "Forever C HH", "Forever Caring",
    "ForeverC HH", "ForeverCare", "Glendale HH", "Good Earth", "Good Remedy", "Guardian Angel HH", "H&R",
    "H & R HOME", "Hajimi HH", "Hand in Heart", "HandinHeart", "Handinhearth", "HandinHearth", "Happy HH",
    "Happy Life HH", "Hearten HH", "HH Plus", "Holy Angel", "Holy Infant", "Holy Infant HH", "Holy Infant HR",
    "Home Care Excellence", "Home Health Plus", "Home Rehabilitation", "Horizon HH", "Hygieia HH", "Impress",
    "Impress HH", "Inland", "Inland Empire", "Inland Empire HH", "Inglewood", "Inglewood HH", "Intake",
    "Integrated HH", "Intra care HH", "Ivory", "Ivory HH", "Ivory/Gifty", "Key to Health", "KeyTo HH",
    "KeyToHealth", "LA HH", "LA Home Care", "LA Home Health", "LA United home", "Legacy", "Legacy HH",
    "Level", "Level HH", "Level Home H", "Life & Hope", "Life & Hope HH", "LikeFamly HH", "Los Angeles HH",
    "Mayerling", "Mayerling HH", "Med Group", "Med Group HH", "Med Health", "MedGroup", "Medgroup",
    "Medz Hospice Care", "Merit", "Merit HH", "Milano HH", "MORNING STAR HHC", "Multiskilled", "Mulitskilled",
    "New Hope HH", "New Horizon", "New Horizon HH", "New Horizons", "Nurse's HH", "Nurses Resource", "Ogada",
    "Onoria Healthcare", "Orange Home Health", "Oremos", "Pacific", "Paramount", "Paramount HC",
    "Pegasus Home Health", "Prestigious", "Prestigious HH", "Prime Care", "Prime Care Health", "PrimeCare",
    "PrimeH", "PT/OT staffing", "Quantum HH", "Real Assurance", "Relief", "Relief Home Health", "Relyable Home",
    "Relyable Home Health", "Resolute HH", "Santa Rosa Hospice", "Sierra", "Sierra HH", "SierraHH",
    "Silver Lining HH", "Sima Corporate G.", "Skilled HH", "SNE", "SoCal Integrated", "SOCAL CARE",
    "Social Integrated", "SOCAL INTEGRATED", "SOCAL INTEGRATED CARE", "St. Lukes", "Starlight HH", "Sunnyland",
    "Sunset", "Sunset HH", "Sunshine", "Sunshine HH", "Sunshine HHS", "Supportive", "Supportive HH",
    "Supportive Hospice", "The Ambient H", "The Lakes HH", "thephcare", "THA HH", "Thrive", "Thrive HH",
    "Total Care", "Total Care HH", "Transitions HH", "United", "United HH", "United HHC", "United Home Health",
    "United Home Health Care", "Universal", "Valley United HH", "Vast", "Vast HH", "VAST HOME HEALTH",
    "Vip HealthCare", "West Coast HH", "Wilshire", "Wilshire HH"
];

// Función para generar teléfono aleatorio
function generateRandomPhone() {
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `(213) ${prefix}-${line}`;
}

// Función para generar email
function generateEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `contact@${cleanName}.com`;
}

async function populateAgencies() {
  try {
    // Crear conexión a la base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kariokito12*',
      database: 'therapists_db'
    });

    console.log('Conectado a MySQL. Comprobando si la tabla agencias existe...');
    
    // Verificar si la tabla existe
    try {
      await connection.query('SELECT 1 FROM agencias LIMIT 1');
      console.log('La tabla agencias existe.');
    } catch (error) {
      console.log('La tabla agencias no existe. Creándola...');
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
      console.log('Tabla agencias creada exitosamente.');
    }
    
    // Comprobar si ya hay agencias en la tabla
    const [existingRows] = await connection.query('SELECT COUNT(*) as count FROM agencias');
    
    if (existingRows[0].count > 0) {
      console.log(`Ya existen ${existingRows[0].count} agencias en la base de datos. ¿Deseas continuar? (Esto no afectará a la tabla therapists)`);
      console.log('Insertando agencias adicionales...');
    }
    
    // Preparar los valores para la inserción
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
    
    // Insertar las agencias
    const query = `
      INSERT INTO agencias 
      (name, email, address, phone, status, docs, logo, patients) 
      VALUES ?
    `;
    
    const [result] = await connection.query(query, [values]);
    console.log(`¡${result.affectedRows} agencias insertadas correctamente!`);
    console.log('Nota: La tabla therapists no ha sido modificada en absoluto.');
    
    // Cerrar la conexión
    await connection.end();
    console.log('Conexión cerrada.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
populateAgencies();