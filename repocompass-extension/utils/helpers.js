// Utils - Shared utility functions for RepoComPass

/**
 * Cache Manager
 * Handles caching of API responses to reduce costs and improve performance
 */
export class CacheManager {
  constructor(defaultExpiry = 24 * 60 * 60 * 1000) { // 24 hours default
    this.defaultExpiry = defaultExpiry;
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(prefix, ...params) {
    const sanitized = params
      .filter(Boolean)
      .map(p => String(p).toLowerCase().replace(/\s+/g, '_'))
      .join('_');
    return `cache_${prefix}_${sanitized}`;
  }

  /**
   * Get cached data if valid
   */
  async get(key) {
    try {
      const result = await chrome.storage.local.get(key);
      if (!result[key]) return null;

      const { data, timestamp, expiry } = result[key];
      const expiryTime = expiry || this.defaultExpiry;

      if (Date.now() - timestamp > expiryTime) {
        // Cache expired, clean up
        await chrome.storage.local.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache data
   */
  async set(key, data, customExpiry = null) {
    try {
      await chrome.storage.local.set({
        [key]: {
          data,
          timestamp: Date.now(),
          expiry: customExpiry || this.defaultExpiry
        }
      });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Remove specific cache entry
   */
  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll() {
    try {
      const all = await chrome.storage.local.get(null);
      const cacheKeys = Object.keys(all).filter(k => k.startsWith('cache_'));
      await chrome.storage.local.remove(cacheKeys);
      return cacheKeys.length;
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const all = await chrome.storage.local.get(null);
      const cacheEntries = Object.entries(all).filter(([k]) => k.startsWith('cache_'));
      
      let validCount = 0;
      let expiredCount = 0;
      let totalSize = 0;

      for (const [key, value] of cacheEntries) {
        const size = JSON.stringify(value).length;
        totalSize += size;

        const expiryTime = value.expiry || this.defaultExpiry;
        if (Date.now() - value.timestamp > expiryTime) {
          expiredCount++;
        } else {
          validCount++;
        }
      }

      return {
        totalEntries: cacheEntries.length,
        validEntries: validCount,
        expiredEntries: expiredCount,
        totalSizeBytes: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}

/**
 * Rate Limiter
 * Prevents API rate limit issues
 */
export class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if request can be made
   * @param {string} api - API identifier
   * @param {number} limit - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   */
  canRequest(api, limit, windowMs = 60000) {
    const now = Date.now();
    
    if (!this.requests.has(api)) {
      this.requests.set(api, []);
    }

    const timestamps = this.requests.get(api);
    
    // Clean old timestamps
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    this.requests.set(api, validTimestamps);

    if (validTimestamps.length >= limit) {
      return {
        allowed: false,
        retryAfter: Math.ceil((validTimestamps[0] + windowMs - now) / 1000)
      };
    }

    validTimestamps.push(now);
    return { allowed: true, retryAfter: 0 };
  }

  /**
   * Get remaining requests for an API
   */
  getRemaining(api, limit, windowMs = 60000) {
    const now = Date.now();
    const timestamps = this.requests.get(api) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    return Math.max(0, limit - validTimestamps.length);
  }

  /**
   * Reset rate limit for an API
   */
  reset(api) {
    this.requests.delete(api);
  }
}

/**
 * Text utilities for parsing and processing
 */
export const TextUtils = {
  /**
   * Extract email addresses from text
   */
  extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  },

  /**
   * Extract URLs from text
   */
  extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    return text.match(urlRegex) || [];
  },

  /**
   * Clean and normalize text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim();
  },

  /**
   * Truncate text with ellipsis
   */
  truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Extract name from email or URL
   */
  extractNameFromIdentifier(identifier) {
    // From email: john.doe@company.com -> John Doe
    if (identifier.includes('@')) {
      const local = identifier.split('@')[0];
      return local
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // From LinkedIn URL: /in/john-doe -> John Doe
    if (identifier.includes('linkedin.com/in/')) {
      const slug = identifier.split('/in/')[1]?.split('/')[0] || '';
      return slug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return identifier;
  }
};

/**
 * Storage helpers
 */
export const StorageUtils = {
  /**
   * Get settings with defaults
   */
  async getSettings() {
    const defaults = {
      openaiKey: '',
      githubToken: '',
      serpApiKey: '',
      enableCache: true,
      autoAnalyze: false,
      cacheExpiry: 24
    };

    try {
      const result = await chrome.storage.local.get('settings');
      return { ...defaults, ...(result.settings || {}) };
    } catch (error) {
      console.error('Get settings error:', error);
      return defaults;
    }
  },

  /**
   * Save settings
   */
  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ settings });
      return true;
    } catch (error) {
      console.error('Save settings error:', error);
      return false;
    }
  },

  /**
   * Get storage usage
   */
  async getUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse(null);
      const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default
      return {
        used: bytesInUse,
        usedKB: (bytesInUse / 1024).toFixed(2),
        usedMB: (bytesInUse / 1024 / 1024).toFixed(2),
        quota,
        quotaMB: (quota / 1024 / 1024).toFixed(2),
        percentUsed: ((bytesInUse / quota) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Get usage error:', error);
      return null;
    }
  }
};

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
