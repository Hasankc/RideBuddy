import { profanityFilter } from './profanity';
import { detect as detectLanguage } from 'detect-language';

export interface SafetyCheck {
  isSafe: boolean;
  reason?: string;
}

export const contentSafetyCheck = async (content: string): Promise<SafetyCheck> => {
  // Check for profanity
  if (profanityFilter.isProfane(content)) {
    return {
      isSafe: false,
      reason: 'Content contains inappropriate language'
    };
  }

  // Check content length
  if (content.length > 1000) {
    return {
      isSafe: false,
      reason: 'Content exceeds maximum length'
    };
  }

  // Check for spam patterns
  if (hasSpamPatterns(content)) {
    return {
      isSafe: false,
      reason: 'Content appears to be spam'
    };
  }

  // Check for personal information
  if (containsPersonalInfo(content)) {
    return {
      isSafe: false,
      reason: 'Content contains personal information'
    };
  }

  return { isSafe: true };
};

export const imageSafetyCheck = async (file: File): Promise<SafetyCheck> => {
  // Check file size
  if (file.size > 5 * 1024 * 1024) {
    return {
      isSafe: false,
      reason: 'File size exceeds 5MB limit'
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isSafe: false,
      reason: 'Invalid file type'
    };
  }

  // Additional image checks can be added here
  // - NSFW detection
  // - Image manipulation detection
  // - Metadata stripping

  return { isSafe: true };
};

export const locationSafetyCheck = (coordinates: [number, number]): SafetyCheck => {
  const [lat, lng] = coordinates;

  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return {
      isSafe: false,
      reason: 'Invalid coordinates'
    };
  }

  // Add additional location checks
  // - Restricted areas
  // - Privacy zones
  // - Location spoofing detection

  return { isSafe: true };
};

export const userSafetyScore = (user: any): number => {
  let score = 100;

  // Profile completeness
  if (!user.profile.bio) score -= 10;
  if (!user.profile.images.length) score -= 20;
  if (!user.profile.interests.length) score -= 10;

  // Account age
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  if (accountAge < 24 * 60 * 60 * 1000) score -= 30; // Less than 24 hours

  // Verification status
  if (!user.isEmailVerified) score -= 20;
  if (!user.isPhoneVerified) score -= 20;

  // Report history
  const reportCount = user.reports?.length || 0;
  score -= reportCount * 15;

  return Math.max(0, score);
};

// Helper functions
const hasSpamPatterns = (content: string): boolean => {
  const spamPatterns = [
    /\b(buy|sell|discount|offer)\b/i,
    /\b(click here|visit now)\b/i,
    /\b(whatsapp|telegram|snapchat)\b/i,
    /\b\d{10}\b/, // Phone numbers
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, // Email addresses
  ];

  return spamPatterns.some(pattern => pattern.test(content));
};

const containsPersonalInfo = (content: string): boolean => {
  const personalInfoPatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
    /\b[A-Z]{2}\d{6}\b/, // Passport numbers
    /\b\d{16}\b/, // Credit card numbers
    /\b\d{5}(?:[-\s]\d{4})?\b/, // ZIP codes
  ];

  return personalInfoPatterns.some(pattern => pattern.test(content));
};