import { Song } from "./song.model";

export interface Setlist {
    id: number;
    name: string;
    description: string;
    songCount: number;
    createdAt: string;
}

export interface SetlistDetail {
    id: number;
    name: string;
    description: string;
    songs: Song[];
    createdAt: string;
}