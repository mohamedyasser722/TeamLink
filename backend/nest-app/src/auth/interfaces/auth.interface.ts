import { User } from '../../entities/user.entity';

export interface ITokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in?: number;
}

export interface IAuthResponse extends ITokenResponse {
  user: User;
}

export interface IUserProfile {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
} 