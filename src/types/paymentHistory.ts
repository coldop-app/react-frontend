// ==========================
// Payment History Types
// ==========================

export type PaymentType = 'RENT' | 'EXPENSE' | 'PAYMENT';

export interface CreatePaymentHistoryInput {
  farmerStorageLinkId: string;
  date: string; // ISO format: "2026-01-17T00:00:00.000Z"
  amount: number;
  type: PaymentType;
  remarks?: string | null;
  createdBy: string; // Store admin ID
  voucherId?: string | null; // Optional voucher ID
}

export interface PaymentHistoryResponse {
  id: string;
  farmerStorageLinkId: string;
  date: string;
  amount: number;
  type: PaymentType;
  remarks: string | null;
  createdBy: string;
  voucherId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentHistoryApiResponse {
  success: boolean;
  message: string;
  data: {
    payment: PaymentHistoryResponse;
  };
}

export interface GetPaymentHistoryApiResponse {
  success: boolean;
  message: string;
  data: PaymentHistoryResponse[];
}

export interface UpdatePaymentHistoryInput {
  id: string;
  amount?: number;
  remarks?: string | null;
  voucherId?: string | null;
}

export interface UpdatePaymentHistoryApiResponse {
  success: boolean;
  message: string;
  data: {
    payment: PaymentHistoryResponse;
  };
}
