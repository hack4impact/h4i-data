import { VolunteerValidator, ValidationError } from
  '../../../src/utils/validators';
  import { VolunteerStatus, VolunteerType } from '../../../src/types';

  describe('VolunteerValidator', () => {
    describe('validateId', () => {
      it('should validate valid UUID', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(() => VolunteerValidator.validateId(validUuid)).not.toThrow();
      });

      it('should throw ValidationError for invalid UUID format', () => {
        const invalidUuid = 'invalid-uuid';
        expect(() => VolunteerValidator.validateId(invalidUuid))
          .toThrow(ValidationError);
        expect(() => VolunteerValidator.validateId(invalidUuid))
          .toThrow('Invalid ID format. Must be a valid UUID');
      });

      it('should throw ValidationError for empty ID', () => {
        expect(() => VolunteerValidator.validateId('')).toThrow(ValidationError);
        expect(() => VolunteerValidator.validateId('')).toThrow('ID is required');
      });

      it('should throw ValidationError for null/undefined ID', () => {
        expect(() => VolunteerValidator.validateId(null as
  any)).toThrow(ValidationError);
        expect(() => VolunteerValidator.validateId(undefined as
  any)).toThrow(ValidationError);
      });
    });

    describe('validateVolunteerInput', () => {
      const validInput = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
        graduation_date: new Date('2024-06-15'),
        volunteer_status: VolunteerStatus.STUDENT,
        volunteer_type: VolunteerType.CHAPTER,
        university_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      it('should validate valid volunteer input', () => {
        expect(() =>
  VolunteerValidator.validateVolunteerInput(validInput)).not.toThrow();
      });

      it('should throw ValidationError for missing required fields', () => {
        const invalidInput = { ...validInput, first_name: '' };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow(ValidationError);
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('first_name is required');
      });

      it('should throw ValidationError for invalid email format', () => {
        const invalidInput = { ...validInput, email: 'invalid-email' };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Invalid email format');
      });

      it('should throw ValidationError for invalid volunteer status', () => {
        const invalidInput = { ...validInput, volunteer_status: 'INVALID' as any
  };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Invalid volunteer_status');
      });

      it('should throw ValidationError for invalid volunteer type', () => {
        const invalidInput = { ...validInput, volunteer_type: 'INVALID' as any };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Invalid volunteer_type');
      });

      it('should throw ValidationError for invalid graduation date', () => {
        const invalidInput = { ...validInput, graduation_date: new
  Date('invalid') };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Invalid graduation_date format');
      });

      it('should throw ValidationError for invalid university_id UUID', () => {
        const invalidInput = { ...validInput, university_id: 'invalid-uuid' };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Invalid university_id format. Must be a valid UUID');
      });

      it('should accumulate multiple validation errors', () => {
        const invalidInput = {
          ...validInput,
          first_name: '',
          email: 'invalid-email',
          volunteer_status: 'INVALID' as any,
        };
        expect(() => VolunteerValidator.validateVolunteerInput(invalidInput))
          .toThrow('Validation failed: first_name is required, Invalid email 
  format, Invalid volunteer_status');
      });
    });

    describe('sanitizeVolunteerInput', () => {
      it('should trim whitespace and convert emails to lowercase', () => {
        const input = {
          first_name: '  John  ',
          last_name: '  Doe  ',
          email: '  JOHN@TEST.COM  ',
          H4I_email: '  JOHN@HACK4IMPACT.ORG  ',
          graduation_date: new Date('2024-06-15'),
          volunteer_status: VolunteerStatus.STUDENT,
          volunteer_type: VolunteerType.CHAPTER,
          university_id: '  123e4567-e89b-12d3-a456-426614174000  ',
        };

        const result = VolunteerValidator.sanitizeVolunteerInput(input);

        expect(result.first_name).toBe('John');
        expect(result.last_name).toBe('Doe');
        expect(result.email).toBe('john@test.com');
        expect(result.H4I_email).toBe('john@hack4impact.org');

  expect(result.university_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      });

      it('should handle undefined optional fields', () => {
        const input = {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@test.com',
          graduation_date: new Date('2024-06-15'),
          volunteer_status: VolunteerStatus.STUDENT,
          volunteer_type: VolunteerType.CHAPTER,
          university_id: '123e4567-e89b-12d3-a456-426614174000',
        };

        const result = VolunteerValidator.sanitizeVolunteerInput(input);
        expect(result.H4I_email).toBeUndefined();
      });
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct name', () => {
      const error = new ValidationError('Test message');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test message');
      expect(error).toBeInstanceOf(Error);
    });
  });
