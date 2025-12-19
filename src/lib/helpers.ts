export const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

// Helper to format date → dd.mm.yyyy
export const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

// Helper to convert dd.mm.yyyy format to ISO format (2025-12-19T00:00:00.000Z)
export const formatDateToISO = (dateString: string): string => {
  const [day, month, year] = dateString.split('.').map(Number);
  if (!day || !month || !year) {
    // If parsing fails, return current date in ISO format
    return new Date().toISOString();
  }
  // Construct ISO string directly to avoid timezone issues
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}T00:00:00.000Z`;
};

/**
 * Checks if admin info exists in localStorage and is not expired.
 * This function can be used outside React components (e.g., in route beforeLoad).
 * @returns true if admin info exists and is valid, false otherwise
 */
export function isAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem('store-storage');
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const { timestamp, value } = parsed;

    // Check if expired (1 week expiry)
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > ONE_WEEK) {
      localStorage.removeItem('store-storage');
      return false;
    }

    // Check if admin exists in the stored value
    return value?.state?.admin !== null && value?.state?.admin !== undefined;
  } catch {
    return false;
  }
}
