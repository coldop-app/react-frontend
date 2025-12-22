/**
 * Preferences API Response (includes timestamps)
 */
export interface PreferencesApiResponse {
  success: boolean;
  message?: string;
  data: PreferencesData;
}

/**
 * Preferences data structure from API
 */
export interface PreferencesData {
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
  createdAt: string;
  updatedAt: string;
}
