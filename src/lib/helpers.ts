export const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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
