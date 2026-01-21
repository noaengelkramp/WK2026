import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh tokens
 */
export const generateTokens = (payload: JwtPayload): TokenResponse => {
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
