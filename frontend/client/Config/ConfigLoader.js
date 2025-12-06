/**
 * Dynamic Configuration Loader for Web Apps
 * 
 * Fetches runtime configuration from backend API
 * Caches in localStorage for 24 hours
 * 
 * This replaces hard-coded environment variables like:
 * - Payment gateway URLs
 * - Feature flags
 * - API keys
 * - Branding settings
 */

const CACHE_KEY = 'app-config';
const CACHE_EXPIRY_KEY = 'app-config-expiry';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load app configuration from backend
 * 
 * @param {string} apiBaseUrl - Base URL for API (e.g., 'http://localhost:4001/api')
 * @param {Object} options - Options
 * @param {boolean} options.forceRefresh - Skip cache and fetch fresh
 * @param {number} options.cacheDuration - Cache duration in milliseconds
 * @returns {Promise<Object>} Configuration object
 */
export async function loadAppConfig(apiBaseUrl, options = {}) {
    const { forceRefresh = false, cacheDuration = DEFAULT_CACHE_DURATION } = options;

    try {
        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = getCachedConfig();
            if (cached) {
                console.log('📦 Using cached app config');

                // Refresh in background (fire and forget)
                refreshConfigInBackground(apiBaseUrl, cacheDuration);

                return cached;
            }
        }

        // Fetch from API
        console.log('🌐 Fetching app config from API...');
        const config = await fetchConfigFromAPI(apiBaseUrl);

        // Cache the result
        cacheConfig(config, cacheDuration);

        console.log('✅ App config loaded successfully');
        return config;
    } catch (error) {
        console.error('❌ Error loading app config:', error);

        // Try to use cached config even if expired
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            console.warn('⚠️ Using expired cache due to API error');
            return JSON.parse(cached);
        }

        // Return minimal fallback config
        console.warn('⚠️ Using fallback config');
        return getFallbackConfig();
    }
}

/**
 * Fetch configuration from API
 */
async function fetchConfigFromAPI(apiBaseUrl) {
    const url = `${apiBaseUrl}/config/app-settings`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle standardized response format: { success, message, data }
    if (result.success && result.data) {
        return result.data;
    }

    // Handle direct response
    return result;
}

/**
 * Get cached configuration if valid
 */
function getCachedConfig() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (!cached || !expiry) {
            return null;
        }

        // Check if cache is still valid
        const expiryTime = parseInt(expiry, 10);
        const now = Date.now();

        if (now > expiryTime) {
            console.log('⏰ Cache expired');
            return null;
        }

        return JSON.parse(cached);
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

/**
 * Cache configuration
 */
function cacheConfig(config, duration) {
    try {
        const expiry = Date.now() + duration;

        localStorage.setItem(CACHE_KEY, JSON.stringify(config));
        localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());

        console.log(`💾 Config cached (expires in ${duration / 1000 / 60} minutes)`);
    } catch (error) {
        console.error('Error caching config:', error);
    }
}

/**
 * Refresh config in background (non-blocking)
 */
async function refreshConfigInBackground(apiBaseUrl, cacheDuration) {
    try {
        // Small delay to not block main thread
        setTimeout(async () => {
            const config = await fetchConfigFromAPI(apiBaseUrl);
            cacheConfig(config, cacheDuration);
            console.log('🔄 Config refreshed in background');
        }, 1000);
    } catch (error) {
        // Silent fail - cached version is still valid
        console.debug('Background refresh failed (not critical):', error);
    }
}

/**
 * Clear cached configuration
 */
export function clearConfigCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    console.log('🗑️ Config cache cleared');
}

/**
 * Fallback configuration if API is unavailable
 * Minimal config to keep app functional
 */
function getFallbackConfig() {
    return {
        branding: {
            appName: 'Neastore',
            appVersion: '1.0.0',
            tagline: 'Your Neighborhood Store',
        },
        features: {
            maintenanceMode: false,
            smsEnabled: false,
            emailEnabled: true,
        },
        phonepe: {
            callbackPath: '/payments/phonepe/callback',
            redirectPath: '/payment/status',
            enabled: false,
        },
        razorpay: {
            enabled: false,
            keyId: '',
        },
    };
}
