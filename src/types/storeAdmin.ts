// types/storeAdmin.ts
import type { ColdStorage } from './coldStorage';

export interface StoreAdmin {
  id: string;
  coldStorageId: string;
  name: string;
  mobileNumber: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  personalAddress?: string;
}
export interface StoreAdminLoginInput {
  mobileNumber: string;
  password: string;
  isMobile: boolean;
}

export interface StoreAdminLoginResponse {
  success: true; // Only true when login succeeds
  message: string;
  data: {
    admin: StoreAdmin;
    coldStorage: ColdStorage;
    token: string; // token is guaranteed if success is true
  };
}

// Optional error response type
export interface StoreAdminLoginErrorResponse {
  success: false;
  message: string;
}

export type StoreAdminLoginApiResponse = StoreAdminLoginResponse | StoreAdminLoginErrorResponse;
