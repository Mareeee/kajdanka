import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

    private readonly http = inject(HttpClient);

    getMyProfile(): Observable<User> {
        return this.http.get<User>(`/users/me`);
    }
}