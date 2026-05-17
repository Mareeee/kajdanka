import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, SongDetail, SongSummary } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SongService {

    constructor(private http: HttpClient) { }

    searchSongs(params: {
        search?: string; genre?: string; artist?: string; page?: number; size?: number;
    }): Observable<Page<SongSummary>> {
        const httpParams = new HttpParams()
            .set('search', params.search ?? '')
            .set('genre', params.genre ?? '')
            .set('artist', params.artist ?? '')
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 12);
        return this.http.get<Page<SongSummary>>('/songs', { params: httpParams });
    }

    getSong(id: number): Observable<SongDetail> {
        return this.http.get<SongDetail>(`/songs/${id}`);
    }

    getFeatured(count = 8): Observable<SongSummary[]> {
        return this.http.get<SongSummary[]>(`/songs/featured`, { params: { count } });
    }

    getGenres(): Observable<string[]> {
        return this.http.get<string[]>(`/songs/genres`);
    }

    getMySongs(): Observable<SongSummary[]> {
        return this.http.get<SongSummary[]>(`/songs/my`);
    }

    createSong(payload: SongSummary): Observable<SongSummary> {
        return this.http.post<SongSummary>('/songs', payload);
    }

    updateSong(id: number, payload: SongSummary): Observable<SongSummary> {
        return this.http.put<SongSummary>(`/songs/${id}`, payload);
    }

    deleteSong(id: number): Observable<void> {
        return this.http.delete<void>(`/songs/${id}`);
    }
}