import request from 'supertest';
import { createRestApp } from '../../../src/api/rest/server';

const app = createRestApp();

// Helper function to create a partner for tests
const createTestPartner = async () => {
  const partnerData = {
    legal_name: `Test Partner ${Date.now()}.${Math.random()}`,
    mission_statement: 'Helping communities through technology',
    website_url: 'https://example.org',
  };
  const response = await request(app).post('/partners').send(partnerData);
  return response.body;
};

describe('REST API - /partners', () => {
  describe('POST /partners', () => {
    it('should create a new partner', async () => {
      // Arrange
      const partnerData = {
        legal_name: 'Community Tech Org',
        mission_statement: 'Empowering through technology',
        website_url: 'https://commtech.org',
        pcs_organization_type: 'Nonprofit',
        pcs_subject: 'Technology',
        pcs_population: 'Underserved Communities',
      };

      // Act
      const response = await request(app).post('/partners').send(partnerData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('partner_id');
      expect(response.body.legal_name).toBe('Community Tech Org');
    });

    it('should return 400 for invalid data', async () => {
      // Act - missing required legal_name
      const response = await request(app)
        .post('/partners')
        .send({ mission_statement: 'No name' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /partners', () => {
    it('should fetch all partners', async () => {
      // Arrange
      await createTestPartner();

      // Act
      const response = await request(app).get('/partners');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /partners/:id', () => {
    it('should fetch a partner by ID', async () => {
      // Arrange
      const partner = await createTestPartner();

      // Act
      const response = await request(app).get(
        `/partners/${partner.partner_id}`
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.partner_id).toBe(partner.partner_id);
    });

    it('should return 404 for non-existent partner', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/partners/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /partners/:id', () => {
    it('should update a partner', async () => {
      // Arrange
      const partner = await createTestPartner();
      const updateData = { legal_name: 'Updated Partner Name' };

      // Act
      const response = await request(app)
        .patch(`/partners/${partner.partner_id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.legal_name).toBe('Updated Partner Name');
    });

    it('should return 404 for a non-existent partner', async () => {
      const response = await request(app)
        .patch('/partners/00000000-0000-0000-0000-000000000000')
        .send({ legal_name: 'Updated Partner' });
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const partner = await createTestPartner();
      const response = await request(app)
        .patch(`/partners/${partner.partner_id}`)
        .send({ legal_name: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /partners/:id', () => {
    it('should delete a partner', async () => {
      // Arrange
      const partner = await createTestPartner();

      // Act
      const response = await request(app).delete(
        `/partners/${partner.partner_id}`
      );

      // Assert
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(
        `/partners/${partner.partner_id}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for a non-existent partner', async () => {
      const response = await request(app).delete(
        '/partners/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });
});
