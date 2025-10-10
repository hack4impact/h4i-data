// src/core/services/contact.service.ts
import { prisma } from '../../config/database';
import { createContactSchema, updateContactSchema } from '../validators';
import { logger } from '../../config/logger';
import {
  NotFoundError,
  DatabaseError,
} from '../../middleware/error.middleware';
import { z } from 'zod';

// Define types based on Zod schemas for better type safety
type CreateContactInput = z.infer<typeof createContactSchema>;
type UpdateContactInput = z.infer<typeof updateContactSchema>;

export async function getAllContacts() {
  try {
    logger.info('Fetching all contacts');
    const contacts = await prisma.contacts.findMany({
      orderBy: { created_at: 'desc' },
    });

    logger.info('Successfully retrieved contacts', {
      count: contacts.length,
    });

    return contacts;
  } catch (error) {
    logger.error('Failed to fetch contacts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve contacts');
  }
}

export async function getContactById(id: string) {
  try {
    logger.info('Fetching contact by ID', { contactId: id });

    const contact = await prisma.contacts.findUnique({
      where: { contact_id: id },
    });

    if (!contact) {
      logger.warn('Contact not found', { contactId: id });
      throw new NotFoundError('Contact', id);
    }

    logger.info('Successfully retrieved contact', {
      contactId: id,
      contactName: contact.name,
    });

    return contact;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Failed to fetch contact by ID', {
      contactId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to retrieve contact');
  }
}

export async function createContact(data: CreateContactInput) {
  try {
    logger.info('Creating new contact', {
      contactName: data.name,
      contactData: data,
    });

    const contact = await prisma.contacts.create({ data });

    logger.info('Successfully created contact', {
      contactId: contact.contact_id,
      contactName: contact.name,
    });

    return contact;
  } catch (error) {
    logger.error('Failed to create contact', {
      contactData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new DatabaseError('Failed to create contact');
  }
}

export async function updateContact(id: string, data: UpdateContactInput) {
  try {
    logger.info('Updating contact', {
      contactId: id,
      updateData: data,
    });

    const contact = await prisma.contacts.update({
      where: { contact_id: id },
      data,
    });

    logger.info('Successfully updated contact', {
      contactId: id,
      contactName: contact.name,
    });

    return contact;
  } catch (error) {
    logger.error('Failed to update contact', {
      contactId: id,
      updateData: data,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if contact doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      throw new NotFoundError('Contact', id);
    }

    throw new DatabaseError('Failed to update contact');
  }
}

export async function deleteContact(id: string) {
  try {
    logger.info('Deleting contact', { contactId: id });

    const contact = await prisma.contacts.delete({
      where: { contact_id: id },
    });

    logger.info('Successfully deleted contact', {
      contactId: id,
      contactName: contact.name,
    });

    return contact;
  } catch (error) {
    logger.error('Failed to delete contact', {
      contactId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Check if contact doesn't exist
    if (
      error instanceof Error &&
      error.message.includes('Record to delete does not exist')
    ) {
      throw new NotFoundError('Contact', id);
    }

    throw new DatabaseError('Failed to delete contact');
  }
}
