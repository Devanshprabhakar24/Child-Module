/**
 * Utility functions for managing registration ID across the application
 */

const STORAGE_KEY = 'currentRegistrationId';

/**
 * Get registration ID from URL params or localStorage
 */
export function getRegistrationId(searchParams?: URLSearchParams | null): string | null {
  // First priority: URL query parameter
  if (searchParams) {
    const urlRegId = searchParams.get('registrationId');
    if (urlRegId) {
      // Update localStorage to match URL
      setRegistrationId(urlRegId);
      return urlRegId;
    }
  }

  // Second priority: localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }

  return null;
}

/**
 * Set registration ID in localStorage
 */
export function setRegistrationId(registrationId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, registrationId);
  }
}

/**
 * Clear registration ID from localStorage
 */
export function clearRegistrationId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Validate if a registration ID exists in the database
 */
export async function validateRegistrationId(registrationId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `http://localhost:8000/registration/${registrationId}`,
      { method: 'HEAD' }
    );
    return response.ok;
  } catch {
    return false;
  }
}
