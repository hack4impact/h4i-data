import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../../../src/core';
import { prisma } from '../../../src/config/database';

// Mock the entire prisma module
jest.mock('../../../src/config/database', () => ({
  prisma: {
    contacts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Contact Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllContacts', () => {
    it('should return an array of contacts', async () => {
      const mockContacts = [
        {
          contact_id: '1',
          name: 'Test Contact 1',
          email: 'test1@example.com',
          phone_number: '123-456-7890',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.contacts.findMany as jest.Mock).mockResolvedValue(mockContacts);

      const result = await getAllContacts();

      expect(result).toEqual(mockContacts);
      expect(prisma.contacts.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getContactById', () => {
    it('should return a single contact when a valid ID is provided', async () => {
      const contactId = '1';
      const mockContact = {
        contact_id: contactId,
        name: 'Test Contact 1',
        email: 'test1@example.com',
        phone_number: '123-456-7890',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.contacts.findUnique as jest.Mock).mockResolvedValue(mockContact);

      const result = await getContactById(contactId);

      expect(result).toEqual(mockContact);
      expect(prisma.contacts.findUnique).toHaveBeenCalledWith({
        where: { contact_id: contactId },
      });
    });

    it('should throw NotFoundError if no contact is found', async () => {
      const contactId = 'non-existent-id';
      (prisma.contacts.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getContactById(contactId)).rejects.toThrow(
        "Contact with id 'non-existent-id' not found"
      );
    });
  });

  describe('createContact', () => {
    it('should create and return a new contact', async () => {
      const inputData = {
        name: 'New Contact',
        email: 'new@example.com',
        phone_number: '111-222-3333',
      };
      const createdContact = {
        contact_id: 'new-id-123',
        ...inputData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.contacts.create as jest.Mock).mockResolvedValue(createdContact);

      const result = await createContact(inputData);

      expect(result).toEqual(createdContact);
      expect(prisma.contacts.create).toHaveBeenCalledWith({ data: inputData });
    });
  });

  describe('updateContact', () => {
    it('should update and return the contact', async () => {
      const contactId = '1';
      const updateData = { name: 'Updated Contact Name' };
      const updatedContact = {
        contact_id: contactId,
        name: 'Updated Contact Name',
        email: 'updated@example.com',
        phone_number: '444-555-6666',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.contacts.update as jest.Mock).mockResolvedValue(updatedContact);

      const result = await updateContact(contactId, updateData);

      expect(result).toEqual(updatedContact);
      expect(prisma.contacts.update).toHaveBeenCalledWith({
        where: { contact_id: contactId },
        data: updateData,
      });
    });
  });

  describe('deleteContact', () => {
    it('should call delete with the correct ID and return the deleted contact', async () => {
      const contactId = '1';
      const deletedContact = {
        contact_id: contactId,
        name: 'Deleted Contact',
        email: 'deleted@example.com',
        phone_number: '777-888-9999',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.contacts.delete as jest.Mock).mockResolvedValue(deletedContact);

      const result = await deleteContact(contactId);

      expect(result).toEqual(deletedContact);
      expect(prisma.contacts.delete).toHaveBeenCalledWith({
        where: { contact_id: contactId },
      });
    });
  });
});
