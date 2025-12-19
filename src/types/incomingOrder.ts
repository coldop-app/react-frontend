export interface GatePassNumberResponse {
  success: boolean;
  data: {
    nextGatePassNumber: number;
    commodity: Commodity;
    coldStorageId: string;
  };
}
export type Commodity =
  | 'POTATO'
  | 'ONION'
  | 'GARLIC'
  | 'TOMATO'
  | 'CARROT'
  | 'APPLE'
  | 'SWEETS'
  | 'OTHER';

// ==========================
// Incoming Order Types
// ==========================

export interface IncomingOrderBagSize {
  name: string;
  quantityInit: number;
  quantityCurr: number;
  approxWeight: number | null;
  customMarka?: string; // Optional - only included if provided
  locationId?: string; // optional because request doesn't have it, response does
  floor: string | null;
  row: string | null;
  chamber: string | null;
}

export interface IncomingOrderVariety {
  name: string;
  bagSizes: IncomingOrderBagSize[];
}

export interface CreateIncomingOrderInput {
  farmerStorageLinkId: string;
  commodity: string;
  gatePassType?: string; // OPTIONAL (null voucher case)
  gatePassNumber: number;
  remarks?: string | null;
  varieties?: IncomingOrderVariety[]; // OPTIONAL for null voucher case
  date?: string; // OPTIONAL - date in dd.mm.yyyy format
}

export interface IncomingOrderResponseOrder {
  id: string;
  farmerStorageLinkId: string;
  coldStorageId: string | null;
  commodity: string;
  gatePassType: string;
  gatePassNumber: number;
  remarks: string | null;
  currentStockAtThatTime: number | null;
  varieties: IncomingOrderVariety[];
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

export interface CreateIncomingOrderApiResponse {
  success: boolean;
  message: string;
  data: {
    order: IncomingOrderResponseOrder;
  };
}

export interface EditIncomingOrderInput {
  id: string;
  farmerStorageLinkId: string;
  commodity: string;
  gatePassType?: string;
  date: string;
  gatePassNumber: number;
  remarks?: string | null;
  varieties?: IncomingOrderVariety[];
}

export interface EditIncomingOrderApiResponse {
  success: boolean;
  message: string;
  data: {
    order: IncomingOrderResponseOrder;
  };
}
