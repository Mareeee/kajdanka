import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, SongDetail, SongSummary } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SongService {

    private readonly API = 'http://localhost:8080/api/songs';

    constructor(private http: HttpClient) { }

    searchSongs(params: {
        search?: string;
        genre?: string;
        artist?: string;
        page?: number;
        size?: number;
    }): Observable<Page<SongSummary>> {
        const httpParams = new HttpParams()
            .set('search', params.search ?? '')
            .set('genre', params.genre ?? '')
            .set('artist', params.artist ?? '')
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 12);

        return this.http.get<Page<SongSummary>>(this.API, { params: httpParams });
    }

    getSong(id: number): Observable<SongDetail> {
        return this.http.get<SongDetail>(`${this.API}/${id}`);
    }

    getFeatured(count = 8): Observable<SongSummary[]> {
        return this.http.get<SongSummary[]>(`${this.API}/featured`, {
            params: { count }
        });
    }

    getGenres(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API}/genres`);
    }
}