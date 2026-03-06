import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

interface JwtPayload {
  sub: string;
  name: string;
  permissions: string[];
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:3000';
  private readonly http = inject(HttpClient);
  private readonly _user = signal<JwtPayload | null>(null);
  private readonly _permissions = signal<Set<string>>(new Set());

  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) this.setToken(token);
  }

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.API}/auth/login`, { email, password })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  logout() {
    this._user.set(null);
    this._permissions.set(new Set());
    localStorage.removeItem('token');
  }

  hasPermission(permission: string): boolean {
    return this._permissions().has(permission);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    const payload = this.parseJwt(token);
    this._user.set(payload);
    this._permissions.set(new Set(payload.permissions));
    localStorage.setItem('token', token);
  }

  private parseJwt(token: string): JwtPayload {
    const base64 = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  }
}
