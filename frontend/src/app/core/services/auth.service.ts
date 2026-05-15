import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API = 'http://localhost:8080/api/auth';
    private isBrowser: boolean;

    private _currentUser = signal<AuthUser | null>(null);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
    readonly isPremium = computed(() =>
        this._currentUser()?.role === 'PREMIUM' || this._currentUser()?.role === 'ADMIN'
    );

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        if (this.isBrowser) {
            this._currentUser.set(this.loadUserFromStorage());
        }
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/register`, request).pipe(
            tap(response => this.saveSession(response))
        );
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
            tap(response => this.saveSession(response))
        );
    }

    refreshToken(): Observable<AuthResponse> {
        if (!this.isBrowser) return of();

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        return this.http.post<AuthResponse>(`${this.API}/refresh`, { refreshToken }).pipe(
            tap(response => this.saveSession(response))
        );
    }

    logout(): void {
        if (this.isBrowser) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
                this.http.post(`${this.API}/logout`, { refreshToken }).subscribe({
                    error: () => { }
                });
            }
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }

        this._currentUser.set(null);
        this.router.navigate(['/']);
    }

    getAccessToken(): string | null {
        return this.isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    }

    private saveSession(response: AuthResponse): void {
        if (this.isBrowser) {
            localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }
        this._currentUser.set(response.user);
    }

    private loadUserFromStorage(): AuthUser | null {
        if (!this.isBrowser) return null;
        const userJson = localStorage.getItem(USER_KEY);
        try {
            return userJson ? JSON.parse(userJson) : null;
        } catch (e) {
            return null;
        }
    }
}