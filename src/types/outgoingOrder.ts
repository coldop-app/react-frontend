import type { Commodity } from './incomingOrder';

// ==========================
// Outgoing Order Types
// ==========================

export interface OutgoingOrderBagSize {
  incomingOrderId: string;
  varietyName: string;
  name: string;
  locationId: string;
  quantityBefore: number;
  quantityRemoved: number;
  quantityAfter: number;
  approxWeight: number;
}

export interface OutgoingOrderVariety {
  name: string;
  bagSizes: OutgoingOrderBagSize[];
}

export interface CreateOutgoingOrderInput {
  farmerStorageLinkId: string;
  commodity: Commodity | string;
  gatePassNumber: number;
  gatePassType: string; // e.g., "DELIVERY"
  remarks?: string | null;
  varieties: OutgoingOrderVariety[];
  date?: string; // OPTIONAL - date in ISO format
  /** true = paid (opens Add Payment after create), false = credit */
  isPaid?: boolean;
  /** Amount paid at voucher time (when isPaid); stored on voucher, pre-fills Add Payment */
  paidAmount?: number;
}

export interface OutgoingOrderResponseOrder {
  id: string;
  farmerStorageLinkId: string;
  coldStorageId: string | null;
  commodity: string;
  gatePassType: string;
  gatePassNumber: number;
  remarks: string | null;
  currentStockAtThatTime: number | null;
  varieties: OutgoingOrderVariety[];
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  farmerStorageLink: {
    id: string;
    farmer: {
      id: string;
      name: string;
      address: string;
      mobileNumber: string;
      imageUrl: string | null;
    };
  };
  createdBy: {
    id: string;
    name: string;
  } | null;
}

export interface CreateOutgoingOrderApiResponse {
  success: boolean;
  message: string;
  data: {
    order: OutgoingOrderResponseOrder;
  };
}
