import { Injectable, signal } from '@angular/core';
import { UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // State reaktif untuk digunakan oleh komponen UI seperti Navbar
  isAuth = signal<boolean>(this.isLoggedIn());

  constructor() {}

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.isAuth.set(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuth.set(false);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUserInfo(): UserInfo | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      // Decode JWT payload (middle part of the token)
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const parsedPayload = JSON.parse(decodedPayload);

      return {
        id: parsedPayload.sub,
        email: parsedPayload.email || parsedPayload.sub,
        roles: parsedPayload.roles || []
      };
    } catch (e) {
      console.error('Failed to parse token payload', e);
      return null;
    }
  }
}
