// src/lib/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  token: string;  // JWT token
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
