import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'songs',
        loadComponent: () =>
            import('./features/songs/song-list/song-list').then(m => m.SongListComponent)
    },
    {
        path: 'songs/:id',
        loadComponent: () =>
            import('./features/songs/song-detail/song-detail').then(m => m.SongDetailComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];