export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: AuthUser;
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: 'GUEST' | 'USER' | 'PREMIUM' | 'ADMIN';
}