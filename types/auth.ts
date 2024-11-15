// src/lib/types/auth.ts
export interface User {
    id: string;
    name?: string;
    email?: string;
    walletAddress: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
  }
  
  export interface SessionResponse {
    success: boolean;
    session?: User;
    error?: string;
  }