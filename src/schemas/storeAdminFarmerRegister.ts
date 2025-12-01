import { z } from 'zod';
import {
  mobileNumberValidation,
  passwordValidation,
  nameValidation,
  addressValidation,
  accountNumberValidation,
} from './storeAdminRegister';

export const storeAdminFarmerRegisterSchema = z.object({
  name: nameValidation,
  address: addressValidation,
  accountNumber: accountNumberValidation,
  mobileNumber: mobileNumberValidation,
  password: passwordValidation,
});
