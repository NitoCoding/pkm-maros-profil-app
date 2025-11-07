// src/libs/database.ts
import mysql from 'mysql2/promise';
// import { config } from 'dotenv';

// Load environment variables
// config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost' ,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pkm_maros_profil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export pool for direct queries
export { pool };

// Helper function for executing queries
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Helper function for single row queries
export async function executeSingleQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  try {
    const [rows] = await pool.execute(query, params);
    const results = rows as T[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Helper function for insert operations
export async function insertData(
  table: string,
  data: Record<string, any>
): Promise<{ id: number; data: Record<string, any> }> {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(data);
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
  `;
  
  const [result] = await pool.execute(query, values);
  
  return {
    id: (result as any).insertId,
    data
  };
}

// Helper function for update operations
export async function updateData(
  table: string,
  id: number | string,
  data: Record<string, any>
): Promise<number> {
  const columns = Object.keys(data);
  const placeholders = columns.map((column) => `${column} = ?`).join(', ');
  const values = Object.values(data);
  
  const query = `
    UPDATE ${table}
    SET ${placeholders}
    WHERE id = ?
  `;
  
  const [result] = await pool.execute(query, [...values, id]);
  
  return (result as any).affectedRows;
}

// Helper function for delete operations
export async function deleteData(
  table: string,
  id: number | string
): Promise<number> {
  const query = `DELETE FROM ${table} WHERE id = ?`;
  
  const [result] = await pool.execute(query, [id]);
  
  return (result as any).affectedRows;
}

// Additional helper functions for migration from Firebase

// Helper function for batch insert operations
export async function batchInsertData(
  table: string,
  dataArray: Record<string, any>[]
): Promise<{ ids: number[]; count: number }> {
  if (dataArray.length === 0) {
    return { ids: [], count: 0 };
  }

  const columns = Object.keys(dataArray[0]);
  const placeholders = dataArray.map(() => 
    `(${columns.map(() => '?').join(', ')})`
  ).join(', ');
  
  const values = dataArray.flatMap(item => Object.values(item));
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES ${placeholders}
  `;
  
  const [result] = await pool.execute(query, values);
  
  return {
    ids: Array.from({ length: dataArray.length }, (_, i) => (result as any).insertId + i),
    count: (result as any).affectedRows
  };
}

// Helper function for transaction operations
export async function executeTransaction<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper function for checking if a record exists
export async function recordExists(
  table: string,
  field: string,
  value: any
): Promise<boolean> {
  const query = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
  const [rows] = await pool.execute(query, [value]);
  return (rows as any[]).length > 0;
}

// Helper function for upsert operations (insert or update)
export async function upsertData(
  table: string,
  data: Record<string, any>,
  conflictFields: string[] = ['id']
): Promise<{ id: number; data: Record<string, any>; isNew: boolean }> {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = Object.values(data);
  
  const updateClause = columns
    .filter(col => !conflictFields.includes(col))
    .map(col => `${col} = VALUES(${col})`)
    .join(', ');
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClause}
  `;
  
  const [result] = await pool.execute(query, values);
  
  const isNew = (result as any).affectedRows === 1;
  
  return {
    id: isNew ? (result as any).insertId : data.id || (result as any).insertId,
    data,
    isNew
  };
}