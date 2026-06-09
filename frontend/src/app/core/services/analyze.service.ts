import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyzeResponse {
    status: string;
    naslov: string;
    izvodjac: string;
    rezultat: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyzeService {

    private readonly pythonApiUrl = 'http://localhost:8000';

    constructor(private http: HttpClient) { }

    analyze(youtubeLink: string, naslov: string, izvodjac: string): Observable<AnalyzeResponse> {
        const formData = new FormData();
        formData.append('youtube_link', youtubeLink);
        formData.append('naslov', naslov);
        formData.append('izvodjac', izvodjac);

        return this.http.post<AnalyzeResponse>(`${this.pythonApiUrl}/analyze`, formData);
    }
}