import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { JwtService } from '@nestjs/jwt';
  import { User } from '../entities/user.entity';
  import { LoginDto } from './dtos/login.dto';
  import { RegisterDto } from './dtos/register.dto';
  import { ApiException } from '../common/exceptions/api.exception';
  import { IAuthResponse, ITokenResponse } from './interfaces/auth.interface';
  import { KeycloakService } from '../keyclock/keyclock.service';
  import { LoggerService } from '../common/services/logger.service';
  
  @Injectable()
  export class AuthService {
    private readonly frontendUrl: string;
  
    constructor(
      private readonly configService: ConfigService,
      private readonly logger: LoggerService,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly keycloakService: KeycloakService,
      private readonly jwtService: JwtService,
    ) {
      this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    }
  
    async register(registerDto: RegisterDto): Promise<User> {
      try {
        // Check if user with username exists
        const existingUsername = await this.userRepository.findOne({
          where: { username: registerDto.username },
        });
        if (existingUsername) {
          throw new ApiException(
            'User with this username already exists',
            409,
            'ERR_USER_EXISTS',
          );
        }
  
        // Check if user with email exists
        const existingUser = await this.userRepository.findOne({
          where: { email: registerDto.email },
        });
        if (existingUser) {
          throw new ApiException(
            'User with this email already exists',
            409,
            'ERR_USER_EXISTS',
          );
        }
  
        // Create user in Keycloak
        const kcUserId = await this.keycloakService.createUser({
          email: registerDto.email,
          password: registerDto.password,
          username: registerDto.username,
        });

        this.logger.log(`Keycloak user created with ID: ${kcUserId}`);
        this.logger.log(`Role assigned to user: ${registerDto.role}`);

        // Assign role to user
        await this.keycloakService.assignRoleToUser(kcUserId, registerDto.role);

        // Create user in local database
        const user = this.userRepository.create({
          ...registerDto,
          keycloakId: kcUserId,
          isActive: true,
        });
  
        const result = await this.userRepository.save(user);
        this.logger.log(`User registered successfully with ID: ${result.id}`);
        return result;
      } catch (error) {
        this.logger.error('Registration failed:', error);
  
        // If we created a Keycloak user but failed to save in our DB,
        // we should clean up the Keycloak user
        if (error.keycloakUserId) {
          try {
            await this.keycloakService.deleteUser(error.keycloakUserId);
          } catch (cleanupError) {
            this.logger.error(
              'Failed to cleanup Keycloak user after registration failure:',
              cleanupError,
            );
          }
        }
        throw error;
      }
    }
  
    async login(loginDto: LoginDto): Promise<IAuthResponse> {
      try {
        // Find user in our database
        const user = await this.userRepository.findOne({
          where: { email: loginDto.email },
        });
  
        if (!user) {
          throw new NotFoundException('User not found');
        }
  
        if (!user.isActive) {
          throw new UnauthorizedException('User account is disabled');
        }
  
        // Get Keycloak token using KeycloakService with remember me option
        const tokenResponse = await this.keycloakService.login(
          loginDto.email,
          loginDto.password,
          loginDto.rememberMe,
        );
  
        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
  
        return {
          user,
          ...tokenResponse,
        };
      } catch (error) {
        throw error;
      }
    }
  
    async getProfile(email: string): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
  
      if (!user) {
        throw new ApiException('User not found', 404, 'ERR_USER_NOT_FOUND');
      }
  
      return user;
    }
  
    async refreshToken(refreshToken: string): Promise<ITokenResponse> {
      return this.keycloakService.refreshToken(refreshToken);
    }
  
    async forgetPassword(email: string): Promise<void> {
      // Check if user exists in our database
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
  
      if (!user) {
        // We don't throw an error to avoid leaking information about user existence
        this.logger.warn(
          `Password reset requested for non-existent user: ${email}`,
        );
        throw new ApiException('User not found', 404, 'ERR_USER_NOT_FOUND');
      }
  
      if (!user.isActive) {
        this.logger.warn(`Password reset requested for inactive user: ${email}`);
        throw new ApiException('User is not active', 400, 'ERR_USER_NOT_ACTIVE');
      }
  
      // Use KeycloakService to send password reset email
      await this.keycloakService.forgetPassword(email);
    }
  
    async forgetPasswordWithRedirect(email: string): Promise<string> {
      try {
        // Check if user exists in our database
        const user = await this.userRepository.findOne({
          where: { email: email },
        });
  
        if (!user) {
          this.logger.warn(`No user found with email: ${email}`);
          throw new ApiException('User not found', 404, 'ERR_USER_NOT_FOUND');
        }
  
        if (!user.isActive) {
          this.logger.warn(
            `Password reset requested for inactive user: ${email}`,
          );
          throw new ApiException(
            'User is not active',
            400,
            'ERR_USER_NOT_ACTIVE',
          );
        }
  
        // Generate a JWT token for password reset
        const resetToken = this.jwtService.sign(
          {
            sub: user.keycloakId,
            email: user.email,
            type: 'password_reset',
          },
          { expiresIn: '1h' },
        );
  
        // Create a custom reset link that points to our frontend
        const resetLink = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;
  
        this.logger.log(`✅ Password reset link generated for: ${email}`);
        return resetLink;
      } catch (error) {
        this.logger.error(
          '❌ Failed to generate password reset link:',
          error?.response?.data || error.message,
        );
        if (error.response?.status === 500) {
          throw new InternalServerErrorException('Failed to generate reset link');
        }
        throw error;
      }
    }
  
    async resetPasswordWithToken(
      token: string,
      newPassword: string,
    ): Promise<void> {
      try {
        // Verify the token
        const payload = this.jwtService.verify(token);
  
        if (!payload || !payload.sub) {
          throw new BadRequestException('Invalid or expired token');
        }
  
        // Get the user from the database
        const user = await this.userRepository.findOne({
          where: { keycloakId: payload.sub },
        });
  
        if (!user) {
          throw new BadRequestException('User not found');
        }
  
        if (!user.isActive) {
          throw new BadRequestException('User account is disabled');
        }
  
        // Reset the password in Keycloak
        await this.keycloakService.resetPassword(user.keycloakId, newPassword);
        this.logger.log(`Password reset successful for user: ${user.email}`);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
  
        this.logger.error('Password reset failed:', error);
        throw new BadRequestException('Failed to reset password');
      }
    }
  
    async resetPassword(
      email: string,
      oldPassword: string,
      newPassword: string,
    ): Promise<void> {
      try {
        // Get the user from the database
        const user = await this.userRepository.findOne({
          where: { email: email },
        });
  
        if (!user) {
          throw new BadRequestException('User not found');
        }
  
        if (!user.isActive) {
          throw new BadRequestException('User account is disabled');
        }
  
        // Verify the old password by attempting to login
        try {
          await this.keycloakService.login(email, oldPassword);
        } catch (error) {
          throw new UnauthorizedException('Current password is incorrect');
        }
  
        // Verify if new password is different from old password
        if (oldPassword === newPassword) {
          throw new BadRequestException(
            'New password cannot be the same as the old password',
          );
        }
  
        // Reset the password in Keycloak
        await this.keycloakService.resetPassword(user.keycloakId, newPassword);
        this.logger.log(`Password changed successfully for user: ${user.email}`);
      } catch (error) {
        if (
          error instanceof BadRequestException ||
          error instanceof UnauthorizedException
        ) {
          throw error;
        }
  
        this.logger.error('Password change failed:', error);
        throw new BadRequestException('Failed to change password');
      }
    }
  
    async authenticateWithGoogle(code: string): Promise<IAuthResponse> {
      try {
        // External calls — no DB interaction yet
        const tokenResponse = await this.keycloakService.exchangeCode(code);
        const userInfo = await this.keycloakService.getUserInfo(
          tokenResponse.access_token,
        );
  
        if (!userInfo || !userInfo.email) {
          throw new UnauthorizedException('Invalid user info');
        }
  
        let user = await this.userRepository.findOne({
          where: { email: userInfo.email },
        });
  
        if (!user) {
          user = this.userRepository.create({
            email: userInfo.email,
            username: userInfo.preferred_username || userInfo.email.split('@')[0],
            isActive: true,
            keycloakId: userInfo.sub,
          });
  
          await this.userRepository.save(user);
        } else {
          user.lastLoginAt = new Date();
          await this.userRepository.save(user);
        }
  
        return { user, ...tokenResponse };
      } catch (error) {
        this.logger.error('Google authentication failed:', error.message);
        throw error instanceof UnauthorizedException
          ? error
          : new UnauthorizedException('Failed to authenticate via Keycloak');
      }
    }
  
    async getAllUsers(): Promise<User[]> {
      return this.userRepository.find();
    }
  
    async deleteUser(user: User): Promise<void> {
      // Remove from Keycloak first
      if (user.keycloakId) {
        try {
          await this.keycloakService.deleteUser(user.keycloakId);
        } catch (error) {
          this.logger.warn(
            `Failed to delete user from Keycloak: ${user.keycloakId}`,
          );
        }
      }
      // Remove from database
      await this.userRepository.remove(user);
    }
  
    async deleteAllUsers(): Promise<void> {
      const users = await this.userRepository.find();
      for (const user of users) {
        await this.deleteUser(user);
      }
    }
  }
  