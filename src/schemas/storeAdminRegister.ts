import { z } from 'zod';
import { capitalizeFirstLetter } from '@/lib/helpers';

export const nameValidation = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')
  .transform(capitalizeFirstLetter);

export const addressValidation = z
  .string()
  .min(2, 'Address must be at least 2 characters')
  .max(100, 'Address must be at most 100 characters')
  .transform(capitalizeFirstLetter);

export const mobileNumberValidation = z
  .string()
  .regex(/^\d{10}$/, 'Mobile number must be 10 digits');

export const passwordValidation = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be at most 100 characters');

export const accountNumberValidation = z
  .number({
    message: 'Account number must be a valid number',
  })
  .int('Account number must be an integer')
  .positive('Account number must be a positive number');

export const storeAdminRegisterSchema = z.object({
  name: nameValidation,
  mobileNumber: mobileNumberValidation,
  password: passwordValidation,
  personalAddress: addressValidation.optional(),
});
