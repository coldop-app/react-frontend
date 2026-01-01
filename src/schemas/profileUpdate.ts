import { z } from 'zod';
import {
  nameValidation,
  addressValidation,
  mobileNumberValidation,
  passwordValidation,
} from './storeAdminRegister';

export const profileUpdateSchema = z.object({
  coldStorageId: z.string().min(1, 'Cold storage ID is required'),
  name: nameValidation,
  personalAddress: addressValidation.optional(),
  mobileNumber: mobileNumberValidation,
  password: passwordValidation.optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  isVerified: z.boolean(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
