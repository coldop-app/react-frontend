import { z } from 'zod';
import { mobileNumberValidation, passwordValidation } from './storeAdminRegister';

export const storeAdminLoginSchema = z.object({
  mobileNumber: mobileNumberValidation,
  password: passwordValidation,
  isMobile: z.boolean(),
});
