const mysql = require('mysql2/promise');
const config = require('../config/db');

// Modelo para manejar las operaciones de agencias en la base de datos
class Agency {
  // Método para crear una conexión a la base de datos
  static async getConnection() {
    try {
      return await mysql.createConnection(config.db);
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      throw new Error('No se pudo conectar con la base de datos');
    }
  }

  // Obtener todas las agencias
  static async getAll() {
    let connection;
    try {
      connection = await this.getConnection();
      const [rows] = await connection.execute(`
        SELECT * FROM agencias 
        ORDER BY name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error al obtener las agencias:', error);
      throw new Error('Error al obtener las agencias');
    } finally {
      if (connection) connection.end();
    }
  }

  // Obtener una agencia por ID
  static async getById(id) {
    let connection;
    try {
      connection = await this.getConnection();
      const [rows] = await connection.execute(`
        SELECT * FROM agencias 
        WHERE id = ?
      `, [id]);
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error al obtener la agencia con ID ${id}:`, error);
      throw new Error(`Error al obtener la agencia con ID ${id}`);
    } finally {
      if (connection) connection.end();
    }
  }

  // Crear una nueva agencia
  static async create(agencyData) {
    let connection;
    try {
      const { name, email, address = 'Los Angeles, California', phone = '', status = 'Activo', docs = 'No', logo = '/api/placeholder/64/64', patients = 0 } = agencyData;
      
      // Validar datos obligatorios
      if (!name) {
        throw new Error('El nombre de la agencia es obligatorio');
      }
      
      connection = await this.getConnection();
      
      const [result] = await connection.execute(`
        INSERT INTO agencias (name, email, address, phone, status, docs, logo, patients) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, email, address, phone, status, docs, logo, patients]);
      
      const newAgency = {
        id: result.insertId,
        name,
        email,
        address,
        phone,
        status,
        docs,
        logo,
        patients
      };
      
      return newAgency;
    } catch (error) {
      console.error('Error al crear la agencia:', error);
      throw new Error('Error al crear la agencia: ' + error.message);
    } finally {
      if (connection) connection.end();
    }
  }

  // Actualizar una agencia existente
  static async update(id, agencyData) {
    let connection;
    try {
      // Verificar si la agencia existe
      const agencyExists = await this.getById(id);
      if (!agencyExists) {
        throw new Error(`No existe una agencia con ID ${id}`);
      }
      
      const { name, email, address, phone, status, docs, logo, patients } = agencyData;
      
      // Validar datos obligatorios
      if (!name) {
        throw new Error('El nombre de la agencia es obligatorio');
      }
      
      connection = await this.getConnection();
      
      const [result] = await connection.execute(`
        UPDATE agencias 
        SET name = ?, email = ?, address = ?, phone = ?, status = ?, docs = ?, logo = ?, patients = ? 
        WHERE id = ?
      `, [name, email, address, phone, status, docs, logo, patients, id]);
      
      if (result.affectedRows === 0) {
        throw new Error(`No se pudo actualizar la agencia con ID ${id}`);
      }
      
      const updatedAgency = {
        id: parseInt(id),
        name,
        email,
        address,
        phone,
        status,
        docs,
        logo,
        patients
      };
      
      return updatedAgency;
    } catch (error) {
      console.error(`Error al actualizar la agencia con ID ${id}:`, error);
      throw new Error(`Error al actualizar la agencia: ${error.message}`);
    } finally {
      if (connection) connection.end();
    }
  }

  // Eliminar una agencia
  static async delete(id) {
    let connection;
    try {
      // Verificar si la agencia existe
      const agencyExists = await this.getById(id);
      if (!agencyExists) {
        throw new Error(`No existe una agencia con ID ${id}`);
      }
      
      connection = await this.getConnection();
      
      const [result] = await connection.execute(`
        DELETE FROM agencias 
        WHERE id = ?
      `, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error(`No se pudo eliminar la agencia con ID ${id}`);
      }
      
      return { id, message: 'Agencia eliminada correctamente' };
    } catch (error) {
      console.error(`Error al eliminar la agencia con ID ${id}:`, error);
      throw new Error(`Error al eliminar la agencia: ${error.message}`);
    } finally {
      if (connection) connection.end();
    }
  }

  // Buscar agencias por nombre
  static async search(searchTerm) {
    let connection;
    try {
      connection = await this.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT * FROM agencias 
        WHERE name LIKE ? 
        ORDER BY name ASC
      `, [`%${searchTerm}%`]);
      
      return rows;
    } catch (error) {
      console.error(`Error al buscar agencias con término "${searchTerm}":`, error);
      throw new Error(`Error al buscar agencias: ${error.message}`);
    } finally {
      if (connection) connection.end();
    }
  }

  // Obtener el total de pacientes
  static async getTotalPatients() {
    let connection;
    try {
      connection = await this.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT SUM(patients) as total 
        FROM agencias
      `);
      
      return rows[0].total || 0;
    } catch (error) {
      console.error('Error al obtener el total de pacientes:', error);
      throw new Error('Error al obtener el total de pacientes');
    } finally {
      if (connection) connection.end();
    }
  }
}

module.exports = Agency;