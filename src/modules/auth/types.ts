export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  level: number;
  points: number;
  totalPoints: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

export interface AuthAPI {
  register(email: string, password: string, nickname?: string): Promise<LoginResult>;
  login(email: string, password: string): Promise<LoginResult>;
  sendVerificationCode(email: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  refreshToken(token: string): Promise<LoginResult>;
  logout(): Promise<void>;
}
