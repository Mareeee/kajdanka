import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Setlist, SetlistDetail } from '../models/setlist.model';

@Injectable({ providedIn: 'root' })
export class SetlistService {

    private http = inject(HttpClient);
    private base = '/setlists';

    getMySetlists(): Observable<Setlist[]> {
        return this.http.get<Setlist[]>(this.base);
    }

    createSetlist(name: string, description: string): Observable<Setlist> {
        return this.http.post<Setlist>(this.base, { name, description });
    }

    getSetlist(id: number): Observable<SetlistDetail> {
        return this.http.get<SetlistDetail>(`${this.base}/${id}`);
    }

    updateSetlist(id: number, name: string, description: string): Observable<Setlist> {
        return this.http.put<Setlist>(`${this.base}/${id}`, { name, description });
    }

    addSong(setlistId: number, songId: number): Observable<SetlistDetail> {
        return this.http.post<SetlistDetail>(`${this.base}/${setlistId}/songs/${songId}`, {});
    }

    removeSong(setlistId: number, songId: number): Observable<SetlistDetail> {
        return this.http.delete<SetlistDetail>(`${this.base}/${setlistId}/songs/${songId}`);
    }
}