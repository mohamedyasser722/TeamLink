import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { KeycloakService } from './keyclock.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly keycloakService: KeycloakService) {}

  /**
   * Public endpoint - no authentication required
   */
  @Get('public')
  @Public()
  getPublicData() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Protected endpoint - requires authentication
   */
  @Get('protected')
  getProtectedData(@AuthenticatedUser() user: any) {
    const userInfo = this.keycloakService.extractUserInfo(user);
    return {
      message: 'This is a protected endpoint',
      user: userInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Admin only endpoint - requires 'admin' role
   */
  @Get('admin')
  @Roles({ roles: ['admin'] })
  getAdminData(@AuthenticatedUser() user: any) {
    const userInfo = this.keycloakService.extractUserInfo(user);
    return {
      message: 'This is an admin-only endpoint',
      user: userInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * User profile endpoint - returns current user information
   */
  @Get('profile')
  getUserProfile(@AuthenticatedUser() user: any) {
    const userInfo = this.keycloakService.extractUserInfo(user);
    
    return {
      profile: userInfo,
      isTokenExpired: this.keycloakService.isTokenExpired(user),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check user roles endpoint
   */
  @Get('roles')
  getUserRoles(@AuthenticatedUser() user: any) {
    const userInfo = this.keycloakService.extractUserInfo(user);
    
    return {
      roles: userInfo?.roles || [],
      hasAdminRole: this.keycloakService.hasRole(user, 'admin'),
      hasUserRole: this.keycloakService.hasRole(user, 'user'),
      resourceAccess: userInfo?.resourceAccess || {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Moderator endpoint - requires 'admin' or 'moderator' role
   */
  @Get('moderator')
  @Roles({ roles: ['admin', 'moderator'] })
  getModeratorData(@AuthenticatedUser() user: any) {
    const userInfo = this.keycloakService.extractUserInfo(user);
    return {
      message: 'This endpoint is for admins and moderators',
      user: userInfo,
      timestamp: new Date().toISOString(),
    };
  }
} 