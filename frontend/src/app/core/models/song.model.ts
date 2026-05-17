import { Comment } from "./comment.model";

export interface Song {
    id: number;
    title: string;
    artist: string;
    genre: string;
    keySignature: string;
    capo: number;
    likeCount: number;
    viewCount: number;
    authorUsername: string;
    createdAt: string;
    lyrics: string;
    comments: Comment[];
}

export interface ChordSegment {
    chord: string | null;
    text: string;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}