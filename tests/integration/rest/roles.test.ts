import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';
import { level_type } from '@prisma/client';

const app = createRestApp();

// Helper to create a role for tests
const createTestRole = async (name = 'Test Role') => {
  const response = await request(app)
    .post('/roles')
    .send({
      name,
      description: 'Test role with permissions',
      permissions: { manage_users: true },
      level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
    });
  return response.body;
};

describe('REST API - /roles', () => {
  describe('POST /roles', () => {
    it('should create a new role', async () => {
      // Act
      const roleData = {
        name: `Admin-${Date.now()}`,
        description: 'Administrator role with full permissions',
        permissions: { manage_users: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      };
      const response = await request(app).post('/roles').send(roleData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('role_id');
      expect(response.body.name).toBe(roleData.name);
      expect(response.body.description).toBe(roleData.description);
    });

    it('should return 400 for invalid data', async () => {
      // Act - empty name is invalid
      const response = await request(app).post('/roles').send({ name: '' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /roles', () => {
    it('should fetch all roles', async () => {
      // Arrange
      await createTestRole(`Role for List ${Date.now()}`);

      // Act
      const response = await request(app).get('/roles');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /roles/:id', () => {
    it('should fetch a role by ID', async () => {
      // Arrange
      const role = await createTestRole(`Role for Fetch ${Date.now()}`);

      // Act
      const response = await request(app).get(`/roles/${role.role_id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.role_id).toBe(role.role_id);
    });

    it('should return 404 for non-existent role', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/roles/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update a role', async () => {
      // Arrange
      const role = await createTestRole(`Role for Update ${Date.now()}`);
      const updateData = {
        name: 'Super Admin',
        description: 'Updated description for admin role',
        permissions: { manage_users: true, manage_events: true },
        level_type: 'OPERATIONS_BOARD_LEVEL' as level_type,
      };

      // Act
      const response = await request(app)
        .patch(`/roles/${role.role_id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.permissions).toEqual(updateData.permissions);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role', async () => {
      // Arrange
      const role = await createTestRole(`Role for Delete ${Date.now()}`);

      // Act
      const response = await request(app).delete(`/roles/${role.role_id}`);

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(`/roles/${role.role_id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
