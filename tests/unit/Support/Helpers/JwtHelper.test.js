/**
 * JwtHelper Tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  refreshToken,
  generateTokenPair,
  generateJti,
  extractTokenFromHeader,
  createAuthHeader,
  isValidTokenStructure,
  getTokenAge,
  getRemainingLifetime,
  JwtHelper,
} from '../../../../framework/Support/Helpers/JwtHelper.js';

describe('JwtHelper', () => {
  const secret = 'test-secret-key';
  let validToken;

  beforeAll(async () => {
    validToken = await generateToken({ userId: 1 }, secret);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = await generateToken(payload, secret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include expiration time', async () => {
      const token = await generateToken({ userId: 1 }, secret, { expiresIn: '1h' });
      const decoded = decodeToken(token);
      
      expect(decoded.payload).toHaveProperty('exp');
    });

    it('should support custom claims', async () => {
      const token = await generateToken({ userId: 1 }, secret, {
        issuer: 'test-issuer',
        audience: 'test-audience',
        subject: 'test-subject',
      });

      const decoded = decodeToken(token);
      expect(decoded.payload.iss).toBe('test-issuer');
      expect(decoded.payload.aud).toBe('test-audience');
      expect(decoded.payload.sub).toBe('test-subject');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const payload = await verifyToken(validToken, secret);
      
      expect(payload).toHaveProperty('userId', 1);
    });

    it('should reject invalid tokens', async () => {
      await expect(verifyToken('invalid.token.here', secret)).rejects.toThrow();
    });

    it('should reject tokens with wrong secret', async () => {
      await expect(verifyToken(validToken, 'wrong-secret')).rejects.toThrow();
    });

    it('should verify issuer if provided', async () => {
      const token = await generateToken({ userId: 1 }, secret, { issuer: 'test' });
      const payload = await verifyToken(token, secret, { issuer: 'test' });
      
      expect(payload.iss).toBe('test');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const decoded = decodeToken(validToken);
      
      expect(decoded).toHaveProperty('header');
      expect(decoded).toHaveProperty('payload');
      expect(decoded).toHaveProperty('signature');
    });

    it('should throw on invalid token format', () => {
      expect(() => decodeToken('invalid-token')).toThrow('Invalid token format');
    });

    it('should throw on null token', () => {
      expect(() => decodeToken(null)).toThrow('Invalid token');
    });
  });

  describe('isTokenExpired', () => {
    it('should detect non-expired tokens', () => {
      expect(isTokenExpired(validToken)).toBe(false);
    });

    it('should detect expired tokens', async () => {
      const expiredToken = await generateToken(
        { userId: 1 },
        secret,
        { expiresIn: '1s' } // Use 1 second instead of 1ms
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should handle tokens without expiration', async () => {
      const token = await generateToken({ userId: 1 }, secret, { expiresIn: null });
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for invalid tokens', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should get expiration date', () => {
      const expiration = getTokenExpiration(validToken);
      
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for tokens without expiration', async () => {
      const token = await generateToken({ userId: 1 }, secret, { expiresIn: null });
      expect(getTokenExpiration(token)).toBeNull();
    });

    it('should return null for invalid tokens', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should create new token from existing', async () => {
      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));
      const newToken = await refreshToken(validToken, secret);
      
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(validToken);

      const payload = await verifyToken(newToken, secret);
      expect(payload.userId).toBe(1);
    });

    it('should not include old iat/exp claims', async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
      const newToken = await refreshToken(validToken, secret);
      const decoded = decodeToken(newToken);
      const oldDecoded = decodeToken(validToken);
      
      expect(decoded.payload.iat).not.toBe(oldDecoded.payload.iat);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', async () => {
      const pair = await generateTokenPair({ userId: 1 }, secret);
      
      expect(pair).toHaveProperty('accessToken');
      expect(pair).toHaveProperty('refreshToken');
      expect(pair).toHaveProperty('expiresIn');
    });

    it('should have different expiration times', async () => {
      const pair = await generateTokenPair({ userId: 1 }, secret, {
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '7d',
      });

      const accessDecoded = decodeToken(pair.accessToken);
      const refreshDecoded = decodeToken(pair.refreshToken);
      
      expect(refreshDecoded.payload.exp).toBeGreaterThan(accessDecoded.payload.exp);
    });

    it('should mark refresh token with type', async () => {
      const pair = await generateTokenPair({ userId: 1 }, secret);
      const decoded = decodeToken(pair.refreshToken);
      
      expect(decoded.payload.type).toBe('refresh');
    });
  });

  describe('generateJti', () => {
    it('should generate unique JWT IDs', () => {
      const jti1 = generateJti();
      const jti2 = generateJti();
      
      expect(jti1).toBeDefined();
      expect(jti2).toBeDefined();
      expect(jti1).not.toBe(jti2);
      expect(jti1).toHaveLength(32);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = extractTokenFromHeader('Bearer abc123');
      expect(token).toBe('abc123');
    });

    it('should return null for invalid format', () => {
      expect(extractTokenFromHeader('abc123')).toBeNull();
      expect(extractTokenFromHeader('Basic abc123')).toBeNull();
      expect(extractTokenFromHeader(null)).toBeNull();
    });
  });

  describe('createAuthHeader', () => {
    it('should create Bearer authorization header', () => {
      const header = createAuthHeader('abc123');
      expect(header).toBe('Bearer abc123');
    });
  });

  describe('isValidTokenStructure', () => {
    it('should validate token structure', () => {
      expect(isValidTokenStructure(validToken)).toBe(true);
      expect(isValidTokenStructure('part1.part2.part3')).toBe(true);
    });

    it('should reject invalid structures', () => {
      expect(isValidTokenStructure('invalid')).toBe(false);
      expect(isValidTokenStructure('only.two')).toBe(false);
      expect(isValidTokenStructure(null)).toBe(false);
    });
  });

  describe('getTokenAge', () => {
    it('should calculate token age', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const age = getTokenAge(validToken);
      
      expect(age).toBeGreaterThan(0);
    });

    it('should return null for invalid tokens', () => {
      expect(getTokenAge('invalid')).toBeNull();
    });
  });

  describe('getRemainingLifetime', () => {
    it('should calculate remaining lifetime', () => {
      const remaining = getRemainingLifetime(validToken);
      
      expect(remaining).toBeGreaterThan(0);
    });

    it('should return 0 for expired tokens', async () => {
      const expiredToken = await generateToken({ userId: 1 }, secret, { expiresIn: '1s' });
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(getRemainingLifetime(expiredToken)).toBe(0);
    });

    it('should return null for tokens without expiration', async () => {
      const token = await generateToken({ userId: 1 }, secret, { expiresIn: null });
      expect(getRemainingLifetime(token)).toBeNull();
    });
  });

  describe('JwtHelper class', () => {
    let helper;

    beforeAll(() => {
      helper = new JwtHelper(secret);
    });

    it('should generate tokens', async () => {
      const token = await helper.generate({ userId: 1 });
      expect(token).toBeDefined();
    });

    it('should verify tokens', async () => {
      const payload = await helper.verify(validToken);
      expect(payload.userId).toBe(1);
    });

    it('should decode tokens', () => {
      const decoded = helper.decode(validToken);
      expect(decoded).toHaveProperty('payload');
    });

    it('should check expiration', () => {
      expect(helper.isExpired(validToken)).toBe(false);
    });

    it('should refresh tokens', async () => {
      const newToken = await helper.refresh(validToken);
      expect(newToken).toBeDefined();
    });

    it('should generate token pairs', async () => {
      const pair = await helper.generatePair({ userId: 1 });
      expect(pair).toHaveProperty('accessToken');
      expect(pair).toHaveProperty('refreshToken');
    });

    it('should provide static methods', () => {
      expect(JwtHelper.generateJti).toBeDefined();
      expect(JwtHelper.extractTokenFromHeader).toBeDefined();
    });
  });
});
