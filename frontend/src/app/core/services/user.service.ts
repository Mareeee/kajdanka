import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

    private readonly http = inject(HttpClient);

    getProfile(username: string): Observable<User> {
        return this.http.get<User>(`/users/${username}`);
    }
}