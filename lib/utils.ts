import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a URL by removing paths and keeping only the base domain
 * @param url - The URL to normalize
 * @returns The normalized base URL
 */
export function normalizeBaseUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Return only the protocol + hostname
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    // If URL parsing fails, return the original string
    console.warn('Failed to normalize URL:', url, error);
    return url;
  }
}

/**
 * Validates if a URL is properly formatted
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    // Add protocol if missing for validation
    const testUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : 'https://' + url;
    
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
}
