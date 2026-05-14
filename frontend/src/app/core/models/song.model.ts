export interface SongSummary {
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
}

export interface SongDetail extends SongSummary {
    lyrics: string;
    comments: Comment[];
}

export interface Comment {
    id: number;
    comment: string;
    username: string;
    createdAt: string;
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