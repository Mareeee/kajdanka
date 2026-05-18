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

    sendComment(songId: number, comment: string): Observable<Comment[]> {
        return this.http.post<Comment[]>(`/comments/${songId}`, comment);
    }

    deleteComment(songId: number, commentId: number): Observable<Comment[]> {
        return this.http.delete<Comment[]>(`/comments/${songId}/${commentId}`);
    }
}