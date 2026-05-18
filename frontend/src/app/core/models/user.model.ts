import { Song } from "./song.model";

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    songs: Song[];
}