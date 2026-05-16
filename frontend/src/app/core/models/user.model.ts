import { SongSummary } from "./song.model";

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    songs: SongSummary[];
}