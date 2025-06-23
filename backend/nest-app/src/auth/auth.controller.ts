import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    UnauthorizedException,
    HttpCode,
    HttpStatus,
    Res,
    Patch,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { AuthService } from './auth.service';
  import { AuthGuard, Public } from 'nest-keycloak-connect';
  import { LoginDto } from './dtos/login.dto';
  import { RegisterDto } from './dtos/register.dto';
  import { ForgetPasswordDto } from './dtos/forget-password.dto';
  import { RefreshTokenDto } from './dtos/refresh-token.dto';
  import { ResetPasswordDto } from './dtos/reset-password.dto';
  import { ResetPasswordTokenDto } from './dtos/reset-password-token.dto';
  import { BaseResponse } from '../common/dto/base.response';
  import { IAuthResponse, ITokenResponse } from './interfaces/auth.interface';
  import { User } from '../entities/user.entity';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { GoogleAuthDto } from './dtos/google-auth.dto';
  import { KeycloakService } from '../keyclock/keyclock.service';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly keycloakService: KeycloakService,
    ) {}
  
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(
      @Body() registerDto: RegisterDto,
    ): Promise<BaseResponse<User>> {
      const user = await this.authService.register(registerDto);
      return BaseResponse.success(user, 'User registered successfully');
    }
  
    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 201, description: 'User successfully logged in' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
      @Body() loginDto: LoginDto,
    ): Promise<BaseResponse<IAuthResponse>> {
      const authResponse = await this.authService.login(loginDto);
      return BaseResponse.success(authResponse, 'Login successful');
    }
  
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req): Promise<BaseResponse<User>> {
      const user = await this.authService.getProfile(req.user.email);
      return BaseResponse.success(user, 'Profile retrieved successfully');
    }
  
    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 201, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(
      @Body() refreshTokenDto: RefreshTokenDto,
    ): Promise<BaseResponse<ITokenResponse>> {
      const tokens = await this.authService.refreshToken(
        refreshTokenDto.refresh_token,
      );
      return BaseResponse.success(tokens, 'Token refreshed successfully');
    }
  
    @Public()
    @Post('forget-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({
      status: 200,
      description: 'Password reset email sent if user exists',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'User is not active' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async forgetPassword(
      @Body() forgetPasswordDto: ForgetPasswordDto,
    ): Promise<BaseResponse<null>> {
      await this.authService.forgetPassword(forgetPasswordDto.email);
  
      return BaseResponse.success(
        null,
        'If your email is registered, you will receive a password reset link',
      );
    }
  
    @Public()
    @Post('forget-password/redirect')
    @ApiOperation({ summary: 'Request password reset with frontend redirect' })
    @ApiResponse({
      status: 200,
      description: 'Password reset link generated and email sent',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async forgetPasswordWithRedirect(
      @Body() forgetPasswordDto: ForgetPasswordDto,
    ): Promise<BaseResponse<{ resetLink: string }>> {
      const resetLink = await this.authService.forgetPasswordWithRedirect(
        forgetPasswordDto.email,
      );
      return BaseResponse.success(
        { resetLink },
        'Password reset link generated successfully',
      );
    }
  
    @Public()
    @Post('reset-password-token')
    @ApiOperation({ summary: 'Reset password using token from email' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid token or password' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async resetPasswordWithToken(
      @Body() resetPasswordTokenDto: ResetPasswordTokenDto,
    ): Promise<BaseResponse<null>> {
      await this.authService.resetPasswordWithToken(
        resetPasswordTokenDto.token,
        resetPasswordTokenDto.newPassword,
      );
      return BaseResponse.success(null, 'Password reset successful');
    }
  
    @Post('reset-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password when logged in' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({
      status: 400,
      description: 'Invalid password or user not found',
    })
    @ApiResponse({ status: 401, description: 'Current password is incorrect' })
    async resetPassword(
      @Request() req,
      @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<BaseResponse<null>> {
      await this.authService.resetPassword(
        req.user.email,
        resetPasswordDto.oldPassword,
        resetPasswordDto.newPassword,
      );
      return BaseResponse.success(null, 'Password changed successfully');
    }
  
    @Public()
    @Post('google/callback')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Authenticate with Google' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Google authentication successful',
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid Google token',
    })
    async googleAuth(
      @Body() googleAuthDto: GoogleAuthDto,
    ): Promise<BaseResponse<IAuthResponse>> {
      const authResponse = await this.authService.authenticateWithGoogle(
        googleAuthDto.code,
      );
      return BaseResponse.success(
        authResponse,
        'Google authentication successful',
      );
    }
  
    @Public()
    @Get('/google')
    @ApiOperation({ summary: 'Redirect to Google OAuth' })
    @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
    redirectToGoogle(@Res({ passthrough: true }) res: Response) {
      const redirectUrl = this.keycloakService.getGoogleRedirectUrl();
      return res.redirect(redirectUrl);
    }
  
    @Get('users')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of users' })
    async getAllUsers(): Promise<BaseResponse<User[]>> {
      const users = await this.authService.getAllUsers();
      return BaseResponse.success(users, 'Users fetched successfully');
    }
  }
  