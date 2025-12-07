/**
 * Configuration Loader - Manages application configuration
 */

const defaults = {
  apiTimeout: 5000,
  maxRetries: 3,
  batchSize: 100,
  enableMetrics: true,
  logLevel: 'info',
  cacheEnabled: true,
  rateLimitPerMinute: 1000
};

let configOverrides = {};
let loadedAt = null;

function loadConfig() {
  const envConfig = {
    apiTimeout: process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT) : undefined,
    maxRetries: process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : undefined,
    batchSize: process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE) : undefined,
    enableMetrics: process.env.ENABLE_METRICS === 'true' ? true : process.env.ENABLE_METRICS === 'false' ? false : undefined,
    logLevel: process.env.LOG_LEVEL,
    cacheEnabled: process.env.CACHE_ENABLED === 'true' ? true : process.env.CACHE_ENABLED === 'false' ? false : undefined,
    rateLimitPerMinute: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT) : undefined
  };

  // Filter out undefined values
  const filtered = Object.fromEntries(
    Object.entries(envConfig).filter(([_, v]) => v !== undefined)
  );

  loadedAt = Date.now();
  return { ...defaults, ...filtered, ...configOverrides };
}

function getConfig() {
  return loadConfig();
}

function setOverride(key, value) {
  configOverrides[key] = value;
}

function clearOverrides() {
  configOverrides = {};
}

function getLoadTimestamp() {
  return loadedAt;
}

function isStale(maxAgeMs = 300000) {
  if (!loadedAt) return true;
  return Date.now() - loadedAt > maxAgeMs;
}

module.exports = {
  loadConfig,
  getConfig,
  setOverride,
  clearOverrides,
  getLoadTimestamp,
  isStale,
  defaults
};

