export interface RegisterData {
  email: string;
  password: string;
  givenName?: string;
  phoneNumber?: string;
  address?: string;
  birthdate?: string;
  fullname?: string;
  middleName?: string;
}

export interface DecodedToken {
  "cognito:groups"?: string[];
  sub: string;
  exp?: number;
}

export interface LoginResponse {
  isSignedIn?: boolean;
  requiresNewPassword?: boolean;
  email?: string;
  temporaryPassword?: string;
  nextStep?: {
    signInStep: string;
  };
}

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAdminUser: boolean;
  userAttributes: Record<string, any> | null;
}
