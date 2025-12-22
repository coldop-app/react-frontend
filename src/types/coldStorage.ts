export interface ColdStorage {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  capacity: number;
  isPaid: boolean;
  isActive: boolean;
  plan: string;

  preferences: ColdStoragePreferences; // ✅ CLEAN FIX

  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
}

export interface ColdStoragePreferences {
  id: string;
  commodities: {
    name: string;
    varieties: string[];
    sizes: string[];
  }[];
  generation: string | null;
  rouging: string | null;
  tuberType: string | null;
  grader: string | null;

  incoming: {
    showCustomMarka: boolean;
  };
  customFields: Record<string, unknown> | null;
}
