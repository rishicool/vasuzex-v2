/**
 * JwtHelper - JWT token management
 * 
 * Provides utilities for JWT token creation, verification, and management.
 */

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import crypto from 'crypto';

/**
 * Generate JWT token
 * 
 * @param {object} payload - Token payload
 * @param {string} secret - Secret key
 * @param {object} options - Token options
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(payload, secret, options = {}) {
  const {
    expiresIn = '1h',
    algorithm = 'HS256',
    issuer = null,
    audience = null,
    subject = null,
    jwtId = null,
  } = options;

  const secretKey = new TextEncoder().encode(secret);
  
  let jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt();

  // Set expiration
  if (expiresIn) {
    const expirationTime = parseExpirationTime(expiresIn);
    jwt = jwt.setExpirationTime(expirationTime);
  }

  // Set optional claims
  if (issuer) jwt = jwt.setIssuer(issuer);
  if (audience) jwt = jwt.setAudience(audience);
  if (subject) jwt = jwt.setSubject(subject);
  if (jwtId) jwt = jwt.setJti(jwtId);

  return await jwt.sign(secretKey);
}

/**
 * Verify JWT token
 * 
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @param {object} options - Verification options
 * @returns {Promise<object>} Decoded payload
 */
export async function verifyToken(token, secret, options = {}) {
  const {
    issuer = null,
    audience = null,
    algorithms = ['HS256'],
  } = options;

  const secretKey = new TextEncoder().encode(secret);

  const verifyOptions = {
    algorithms,
  };

  if (issuer) verifyOptions.issuer = issuer;
  if (audience) verifyOptions.audience = audience;

  try {
    const { payload } = await jwtVerify(token, secretKey, verifyOptions);
    return payload;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Decode JWT token without verification
 * 
 * @param {string} token - JWT token
 * @returns {object} Decoded token parts
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }

  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    return {
      header,
      payload,
      signature: parts[2],
    };
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
}

/**
 * Check if token is expired
 * 
 * @param {string} token - JWT token
 * @returns {boolean} Expired status
 */
export function isTokenExpired(token) {
  try {
    const { payload } = decodeToken(token);
    
    if (!payload.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 * 
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date
 */
export function getTokenExpiration(token) {
  try {
    const { payload } = decodeToken(token);
    
    if (!payload.exp) {
      return null;
    }

    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Refresh token
 * 
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @param {object} options - Token options
 * @returns {Promise<string>} New JWT token
 */
export async function refreshToken(token, secret, options = {}) {
  const payload = await verifyToken(token, secret, { 
    algorithms: options.algorithms || ['HS256'],
  });

  // Remove standard claims
  const { iat, exp, nbf, jti, ...customPayload } = payload;

  return await generateToken(customPayload, secret, options);
}

/**
 * Generate access and refresh token pair
 * 
 * @param {object} payload - Token payload
 * @param {string} secret - Secret key
 * @param {object} options - Token options
 * @returns {Promise<object>} Token pair
 */
export async function generateTokenPair(payload, secret, options = {}) {
  const {
    accessTokenExpiry = '15m',
    refreshTokenExpiry = '7d',
    ...otherOptions
  } = options;

  const accessToken = await generateToken(payload, secret, {
    ...otherOptions,
    expiresIn: accessTokenExpiry,
  });

  const refreshToken = await generateToken(
    { ...payload, type: 'refresh' },
    secret,
    {
      ...otherOptions,
      expiresIn: refreshTokenExpiry,
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpirationTime(accessTokenExpiry),
  };
}

/**
 * Parse expiration time string to seconds
 * 
 * @param {string|number} expiresIn - Expiration time
 * @returns {string|number} Time string for jose
 */
function parseExpirationTime(expiresIn) {
  if (typeof expiresIn === 'number') {
    return `${expiresIn}s`;
  }

  if (typeof expiresIn === 'string') {
    // Convert milliseconds to seconds for jose
    if (expiresIn.endsWith('ms')) {
      const ms = parseInt(expiresIn);
      return Math.max(1, Math.floor(ms / 1000)) + 's';
    }
    return expiresIn;
  }

  return '1h';
}

/**
 * Generate random JWT ID
 * 
 * @returns {string} Random JTI
 */
export function generateJti() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Extract token from Authorization header
 * 
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Create Authorization header
 * 
 * @param {string} token - JWT token
 * @returns {string} Authorization header value
 */
export function createAuthHeader(token) {
  return `Bearer ${token}`;
}

/**
 * Validate token structure
 * 
 * @param {string} token - JWT token
 * @returns {boolean} Valid structure
 */
export function isValidTokenStructure(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Get token age in seconds
 * 
 * @param {string} token - JWT token
 * @returns {number|null} Token age in seconds
 */
export function getTokenAge(token) {
  try {
    const { payload } = decodeToken(token);
    
    if (!payload.iat) {
      return null;
    }

    return Math.floor((Date.now() / 1000) - payload.iat);
  } catch {
    return null;
  }
}

/**
 * Get remaining token lifetime in seconds
 * 
 * @param {string} token - JWT token
 * @returns {number|null} Remaining seconds
 */
export function getRemainingLifetime(token) {
  try {
    const { payload } = decodeToken(token);
    
    if (!payload.exp) {
      return null;
    }

    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

/**
 * JwtHelper class for OOP approach
 */
export class JwtHelper {
  constructor(secret, options = {}) {
    this.secret = secret;
    this.options = options;
  }

  async generate(payload, options = {}) {
    return generateToken(payload, this.secret, { ...this.options, ...options });
  }

  async verify(token, options = {}) {
    return verifyToken(token, this.secret, { ...this.options, ...options });
  }

  decode(token) {
    return decodeToken(token);
  }

  isExpired(token) {
    return isTokenExpired(token);
  }

  getExpiration(token) {
    return getTokenExpiration(token);
  }

  async refresh(token, options = {}) {
    return refreshToken(token, this.secret, { ...this.options, ...options });
  }

  async generatePair(payload, options = {}) {
    return generateTokenPair(payload, this.secret, { ...this.options, ...options });
  }

  static generateJti = generateJti;
  static extractTokenFromHeader = extractTokenFromHeader;
  static createAuthHeader = createAuthHeader;
  static isValidTokenStructure = isValidTokenStructure;
  static getTokenAge = getTokenAge;
  static getRemainingLifetime = getRemainingLifetime;
}

export default JwtHelper;
