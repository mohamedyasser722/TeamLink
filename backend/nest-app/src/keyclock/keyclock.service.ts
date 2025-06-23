import { Injectable } from '@nestjs/common';

@Injectable()
export class KeycloakService {
  /**
   * Extract user information from Keycloak token payload
   */
  extractUserInfo(tokenPayload: any) {
    if (!tokenPayload) {
      return null;
    }

    return {
      keycloakId: tokenPayload.sub,
      username: tokenPayload.preferred_username,
      email: tokenPayload.email,
      firstName: tokenPayload.given_name,
      lastName: tokenPayload.family_name,
      roles: tokenPayload.realm_access?.roles || [],
      resourceAccess: tokenPayload.resource_access || {},
    };
  }

  /**
   * Check if user has specific role
   */
  hasRole(tokenPayload: any, role: string): boolean {
    const userInfo = this.extractUserInfo(tokenPayload);
    return userInfo?.roles?.includes(role) || false;
  }

  /**
   * Check if user has specific client role
   */
  hasClientRole(tokenPayload: any, clientId: string, role: string): boolean {
    const userInfo = this.extractUserInfo(tokenPayload);
    const clientRoles = userInfo?.resourceAccess?.[clientId]?.roles || [];
    return clientRoles.includes(role);
  }

  /**
   * Get user's Keycloak ID from token payload
   */
  getUserKeycloakId(tokenPayload: any): string | null {
    const userInfo = this.extractUserInfo(tokenPayload);
    return userInfo?.keycloakId || null;
  }

  /**
   * Get user's email from token payload
   */
  getUserEmail(tokenPayload: any): string | null {
    const userInfo = this.extractUserInfo(tokenPayload);
    return userInfo?.email || null;
  }

  /**
   * Get user's username from token payload
   */
  getUserUsername(tokenPayload: any): string | null {
    const userInfo = this.extractUserInfo(tokenPayload);
    return userInfo?.username || null;
  }

  /**
   * Validate token format and extract bearer token
   */
  validateAndExtractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format');
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new Error('No token provided');
    }

    return token;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(tokenPayload: any): boolean {
    if (!tokenPayload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return tokenPayload.exp < currentTime;
  }
}
