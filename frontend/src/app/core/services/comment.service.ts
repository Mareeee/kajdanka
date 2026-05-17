import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {

    private readonly http = inject(HttpClient)

    getComments(songId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`/comments/${songId}`);
    }
}