const STORAGE_KEYS = {
  USER_TOKEN: 'kanne-user-token',
  USER_PROFILE: 'kanne-user-profile',
  PRODUCT_CONFIGS: 'kanne-product-configs',
  MARKETING_CONFIGS: 'kanne-marketing-configs',
  BATCH_TASKS: 'kanne-batch-tasks',
  AB_TESTS: 'kanne-ab-tests',
} as const;

export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function getToken(): string | null {
  return getStorageItem<string>(STORAGE_KEYS.USER_TOKEN);
}

export function setToken(token: string): void {
  setStorageItem(STORAGE_KEYS.USER_TOKEN, token);
}

export function removeToken(): void {
  removeStorageItem(STORAGE_KEYS.USER_TOKEN);
}

export function getUserProfile() {
  return getStorageItem(STORAGE_KEYS.USER_PROFILE);
}

export function setUserProfile(profile: any): void {
  setStorageItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export function removeUserProfile(): void {
  removeStorageItem(STORAGE_KEYS.USER_PROFILE);
}

export { STORAGE_KEYS };
