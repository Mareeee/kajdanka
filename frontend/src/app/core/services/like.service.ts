import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LikeService {

    private readonly http = inject(HttpClient)

    isLikedByUser(songId: number): Observable<boolean> {
        return this.http.get<boolean>(`/likes/liked/${songId}`);
    }

    setLiked(songId: number): Observable<boolean> {
        return this.http.get<boolean>(`/likes/like/${songId}`);
    }
}