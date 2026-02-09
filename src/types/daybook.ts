import type { Farmer } from './farmers';
export interface DaybookApiResponse {
  success: boolean;
  message: string;
  data: DaybookOrder[];
  pagination: Pagination;
}

/**
 * Represents a single daybook order (incoming or outgoing)
 */
export interface DaybookOrder {
  id: string;
  type: 'incoming' | 'outgoing';
  farmerStorageLinkId: string;
  coldStorageId: string;
  date: string; // ISO string
  commodity: string;
  gatePassType: 'RECEIPT' | 'DELIVERY';
  gatePassNumber: number;
  remarks: string;
  currentStockAtThatTime: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  farmerStorageLink: FarmerStorageLink;
  varieties: Variety[];
  totalBags?: number; // present in outgoing
  totalWeight?: number; // present in outgoing
  createdBy?: CreatedBy; // present in outgoing
  /** Incoming only: store charge / rent for this voucher */
  storeCharge?: number;
  rentEntry?: RentEntry; // present in incoming when store charge is paid
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

/**
 * Represents the farmer linkage info in an order
 */
export interface FarmerStorageLink {
  id: string;
  accountNumber?: number; // present in incoming
  farmer: Farmer;
}

/**
 * Represents a farmer entity
 */

/**
 * Represents a variety under a commodity
 */
export interface Variety {
  name: string;
  bagSizes: BagSize[];
}

/**
 * Represents details of a particular bag size and location info
 */
export interface BagSize {
  name: string; // e.g. "25kg" or "50kg"
  quantityInit: number;
  quantityCurr: number;
  approxWeight?: number; // optional because some entries might not include it
  incomingOrderId?: number | null;
  locationId: string;
  floor: string;
  row: string;
  chamber: string;
  /** Price per bag (₹) set at incoming for this size */
  pricePerBag?: number;
}

/**
 * Represents the user who created the outgoing order
 */
export interface CreatedBy {
  id: string;
  name: string;
}

/**
 * Represents a rent entry associated with an incoming order
 */
export interface RentEntry {
  id: string;
  date: string; // ISO string
  amount: number;
  type: string; // e.g., "PAYMENT"
  remarks: string | null;
  createdBy: string;
  voucherId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
