// src/app/models/login-response.dto.ts
export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  nombre: string;
  role: string;
  mensaje: string;
}