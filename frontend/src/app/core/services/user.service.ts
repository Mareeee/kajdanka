import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SongSummary } from '../models/song.model';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    songs: SongSummary[];
}

@Injectable({ providedIn: 'root' })
export class UserService {

    private readonly API = 'http://localhost:8080/api/users';

    constructor(private http: HttpClient) { }

    getMyProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.API}/me`);
    }
}