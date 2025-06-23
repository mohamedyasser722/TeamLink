import {
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import axios from 'axios';
  import { ApiException } from '../common/exceptions/api.exception';
  import { ITokenResponse } from '../../src/auth/interfaces/auth.interface';
  import * as qs from 'qs'; // <-- will not work unless esModuleInterop is false
  
  @Injectable()
  export class KeycloakService {
    private readonly logger = new Logger(KeycloakService.name);
    private readonly keycloakUrl: string;
    private readonly realm: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly frontendUrl: string;
  
    constructor(
      private readonly config: ConfigService,
    ) {
      this.keycloakUrl = this.config.getOrThrow<string>(
        'KEYCLOAK_AUTH_SERVER_URL',
      );
      this.realm = this.config.getOrThrow<string>('KEYCLOAK_REALM');
      this.clientId = this.config.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
      this.clientSecret = this.config.getOrThrow<string>('KEYCLOAK_SECRET');
      this.frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    }
  
    private async getAdminToken(): Promise<string> {
      const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
  
      try {
        const res = await axios.post(tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
  
        return res.data.access_token;
      } catch (error) {
        this.logger.error(
          '❌ Failed to get Keycloak admin token',
          error?.response?.data || error.message,
        );
        throw new ApiException(
          'Failed to connect to Keycloak',
          500,
          'ERR_KEYCLOAK_TOKEN',
        );
      }
    }
  
    async createUser(data: {
      email: string;
      password: string;
      username: string;
    }) {
      const token = await this.getAdminToken();
  
      const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
  
      try {
        const res = await axios.post(
          url,
          {
            username: data.username,
            email: data.email,
            enabled: true,
            emailVerified: true,
            credentials: [
              {
                type: 'password',
                value: data.password,
                temporary: false,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const userId = res.headers['location']?.split('/').pop();
        this.logger.log(
          `✅ Created Keycloak user: ${data.email} (ID: ${userId})`,
        );
        return userId || {};
      } catch (error) {
        this.logger.error(
          '❌ Failed to create Keycloak user:',
          error?.response?.data || error.message,
        );
        throw new ApiException(
          'Failed to create user in Keycloak',
          500,
          'ERR_KEYCLOAK_USER_CREATE',
        );
      }
    }
  
    async assignRoleToUser(userId: string, roleName: string) {
      const token = await this.getAdminToken();
      const realm = this.realm;
      const baseUrl = this.keycloakUrl;
  
      try {
        // 🔍 Get role details by name
        const roleUrl = `${baseUrl}/admin/realms/${realm}/roles/${roleName}`;
        const roleRes = await axios.get(roleUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const role = roleRes.data;
  
        // ➕ Assign role to user
        const mapUrl = `${baseUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;
        await axios.post(
          mapUrl,
          [
            {
              id: role.id,
              name: role.name,
            },
          ],
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
  
        this.logger.log(`✅ Assigned role "${roleName}" to user: ${userId}`);
      } catch (error) {
        this.logger.error(
          '❌ Failed to assign role:',
          error?.response?.data || error.message,
        );
        throw new ApiException(
          'Failed to assign role to user',
          500,
          'ERR_ROLE_ASSIGN',
        );
      }
    }
  
    async deleteUser(userId: string) {
      const token = await this.getAdminToken();
  
      const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;
  
      try {
        await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        this.logger.log(`✅ Deleted Keycloak user: ${userId}`);
      } catch (error) {
        this.logger.error(
          '❌ Failed to delete Keycloak user:',
          error?.response?.data || error.message,
        );
        throw new ApiException(
          'Failed to delete user from Keycloak',
          500,
          'ERR_KEYCLOAK_USER_DELETE',
        );
      }
    }
  
    async login(
      username: string,
      password: string,
      rememberMe?: boolean,
    ): Promise<ITokenResponse> {
      try {
        const response = await axios.post(
          `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            grant_type: 'password',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            username: username,
            password: password,
            scope: rememberMe
              ? 'openid profile email offline_access'
              : 'openid profile email',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
  
        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
          refresh_expires_in: response.data.refresh_expires_in,
        };
      } catch (error) {
        this.logger.error(
          '❌ Login failed:',
          error?.response?.data || error.message,
        );
        throw new UnauthorizedException('Invalid credentials');
      }
    }
  
    async refreshToken(refreshToken: string): Promise<ITokenResponse> {
      try {
        const response = await axios.post(
          `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: refreshToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
  
        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
          refresh_expires_in: response.data.refresh_expires_in,
        };
      } catch (error) {
        this.logger.error(
          '❌ Token refresh failed:',
          error?.response?.data || error.message,
        );
        throw new UnauthorizedException('Invalid refresh token');
      }
    }
  
    async forgetPassword(email: string): Promise<void> {
      const token = await this.getAdminToken();
      const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
  
      try {
        // First, find the user by email
        const userResponse = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            email: email,
            exact: true,
          },
        });
  
        if (!userResponse.data || userResponse.data.length === 0) {
          this.logger.warn(`No user found with email: ${email}`);
          throw new ApiException('User not found', 404, 'ERR_USER_NOT_FOUND');
        }
  
        const userId = userResponse.data[0].id;
  
        // Send password reset email
        const resetUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email`;
        await axios.put(resetUrl, ['UPDATE_PASSWORD'], {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        this.logger.log(`✅ Password reset email sent to: ${email}`);
      } catch (error) {
        this.logger.error(
          '❌ Failed to send password reset email:',
          error?.response?.data || error.message,
        );
        if (error.response.status === 500) {
          throw new InternalServerErrorException('Failed to send email');
        }
        throw error;
      }
    }
  
    async resetPassword(userId: string, newPassword: string): Promise<void> {
      const token = await this.getAdminToken();
      const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`;
  
      try {
        await axios.put(
          url,
          {
            type: 'password',
            value: newPassword,
            temporary: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
  
        this.logger.log(`✅ Password reset for user: ${userId}`);
      } catch (error) {
        this.logger.error(
          '❌ Failed to reset password:',
          error?.response?.data || error.message,
        );
        throw new ApiException(
          'Failed to reset password',
          500,
          'ERR_PASSWORD_RESET',
        );
      }
    }
  
    async exchangeCode(code: string): Promise<ITokenResponse> {
      try {
        const body = qs.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: `${this.frontendUrl}/en/success`,
        });
  
        const response = await axios.post(
          `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
          body,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
  
        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
          refresh_expires_in: response.data.refresh_expires_in,
        };
      } catch (error) {
        this.logger.error('❌ Failed to exchange authorization code:', {
          status: error.response?.status,
          data: error.response?.data || error.message,
        });
  
        throw new UnauthorizedException('Failed to authenticate via Keycloak');
      }
    }
  
    async getUserInfo(accessToken: string): Promise<any> {
      try {
        const response = await axios.get(
          `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
  
        return response.data;
      } catch (error) {
        this.logger.error(
          '❌ Failed to get user info:',
          error?.response?.data || error.message,
        );
        throw new UnauthorizedException('Failed to get user information');
      }
    }
  
    getGoogleRedirectUrl(): string {
      return (
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/auth?` +
        `client_id=${this.clientId}` +
        `&redirect_uri=${this.frontendUrl}/en/success` +
        `&response_type=code` +
        `&scope=openid` +
        `&kc_idp_hint=google`
      );
    }



    //------------------------------------------------------------------------------------------------
  
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
     * Check if token is expired
     */
    isTokenExpired(tokenPayload: any): boolean {
      if (!tokenPayload?.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenPayload.exp < currentTime;
    }
  }
  