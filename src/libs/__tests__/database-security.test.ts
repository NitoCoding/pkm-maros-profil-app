// src/libs/__tests__/database-security.test.ts
/**
 * Security Tests for Database Helper Functions
 * Tests to verify SQL Injection protection is working correctly
 */

import {
  insertData,
  updateData,
  deleteData,
  recordExists,
  batchInsertData,
  upsertData,
  validateTableName,
  validateColumnName,
} from '../database';

describe('Database Security Tests', () => {

  describe('validateTableName', () => {
    it('should accept valid table names from whitelist', () => {
      expect(() => validateTableName('berita')).not.toThrow();
      expect(() => validateTableName('wisata')).not.toThrow();
      expect(() => validateTableName('galeri')).not.toThrow();
      expect(() => validateTableName('users')).not.toThrow();
    });

    it('should reject table names not in whitelist', () => {
      expect(() => validateTableName('invalid_table')).toThrow();
      expect(() => validateTableName('users; DROP TABLE users; --')).toThrow();
      expect(() => validateTableName("berita' OR '1'='1")).toThrow();
    });

    it('should reject SQL injection attempts', () => {
      const injectionAttempts = [
        'users; DROP TABLE users; --',
        "berita' UNION SELECT * FROM users--",
        'wisata; DELETE FROM wisata WHERE 1=1; --',
        "galeri'; EXEC xp_cmdshell('dir'); --",
        'admin_users OR 1=1--',
      ];

      injectionAttempts.forEach(attempt => {
        expect(() => validateTableName(attempt)).toThrow();
      });
    });
  });

  describe('validateColumnName', () => {
    it('should accept valid column names', () => {
      expect(() => validateColumnName('judul')).not.toThrow();
      expect(() => validateColumnName('created_at')).not.toThrow();
      expect(() => validateColumnName('user_id')).not.toThrow();
      expect(() => validateColumnName('gambar_url')).not.toThrow();
    });

    it('should reject column names with special characters', () => {
      expect(() => validateColumnName('judul; DROP TABLE--')).toThrow();
      expect(() => validateColumnName("name' OR '1'='1")).toThrow();
      expect(() => validateColumnName('column-name')).toThrow();
      expect(() => validateColumnName('column.name')).toThrow();
      expect(() => validateColumnName('column name')).toThrow();
      expect(() => validateColumnName('column;DELETE FROM--')).toThrow();
    });

    it('should reject SQL injection attempts in column names', () => {
      const injectionAttempts = [
        "judul'; DROP TABLE users; --",
        "name' OR '1'='1",
        'email; DELETE FROM users WHERE 1=1; --',
        "id; EXEC xp_cmdshell('format c:'); --",
      ];

      injectionAttempts.forEach(attempt => {
        expect(() => validateColumnName(attempt)).toThrow();
      });
    });
  });

  describe('insertData Security', () => {
    it('should reject invalid table names', async () => {
      const data = { judul: 'Test', isi: 'Test content' };

      await expect(
        insertData('malicious_table; DROP TABLE users; --', data)
      ).rejects.toThrow();
    });

    it('should reject invalid column names in data', async () => {
      const data = {
        judul: 'Test',
        isi: 'Test content',
        "malicious_column'; DROP TABLE users; --": 'hack'
      };

      await expect(
        insertData('berita', data as any)
      ).rejects.toThrow();
    });
  });

  describe('updateData Security', () => {
    it('should reject invalid table names', async () => {
      const data = { judul: 'Updated' };

      await expect(
        updateData("berita; DELETE FROM berita WHERE 1=1; --", 1, data)
      ).rejects.toThrow();
    });

    it('should reject invalid column names in update data', async () => {
      const data = {
        judul: 'Updated',
        "malicious'; DROP TABLE users; --": 'hack'
      };

      await expect(
        updateData('berita', 1, data as any)
      ).rejects.toThrow();
    });
  });

  describe('deleteData Security', () => {
    it('should reject invalid table names', async () => {
      await expect(
        deleteData('users; DROP TABLE users; --', 1)
      ).rejects.toThrow();

      await expect(
        deleteData("berita' OR '1'='1'--", 1)
      ).rejects.toThrow();
    });
  });

  describe('recordExists Security', () => {
    it('should reject invalid table names', async () => {
      await expect(
        recordExists('users; DROP TABLE users; --', 'id', 1)
      ).rejects.toThrow();
    });

    it('should reject invalid field names', async () => {
      await expect(
        recordExists('berita', "id; DROP TABLE users; --", 1)
      ).rejects.toThrow();

      await expect(
        recordExists('berita', "email' OR '1'='1", 'test@test.com')
      ).rejects.toThrow();
    });
  });

  describe('batchInsertData Security', () => {
    it('should reject invalid table names', async () => {
      const dataArray = [
        { judul: 'Test 1', isi: 'Content 1' },
        { judul: 'Test 2', isi: 'Content 2' }
      ];

      await expect(
        batchInsertData("berita; DELETE FROM berita--", dataArray)
      ).rejects.toThrow();
    });

    it('should reject invalid column names', async () => {
      const dataArray = [
        {
          judul: 'Test 1',
          isi: 'Content 1',
          "malicious'; DROP TABLE users; --": 'hack'
        }
      ];

      await expect(
        batchInsertData('berita', dataArray as any)
      ).rejects.toThrow();
    });
  });

  describe('upsertData Security', () => {
    it('should reject invalid table names', async () => {
      const data = { id: 1, judul: 'Test', isi: 'Content' };

      await expect(
        upsertData("users; DROP TABLE users; --", data)
      ).rejects.toThrow();
    });

    it('should reject invalid column names', async () => {
      const data = {
        id: 1,
        judul: 'Test',
        "malicious_column'; DROP TABLE users; --": 'hack'
      };

      await expect(
        upsertData('berita', data as any)
      ).rejects.toThrow();
    });

    it('should reject invalid conflict field names', async () => {
      const data = { id: 1, judul: 'Test', isi: 'Content' };

      await expect(
        upsertData('berita', data, ["id'; DROP TABLE users; --"])
      ).rejects.toThrow();
    });
  });
});
