import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

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
        path: 'songs/new',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/songs/song-create/song-create').then(m => m.SongCreateComponent)
    },
    {
        path: 'songs/artist/:artist',
        loadComponent: () =>
            import('./features/songs/artist-songs/artist-songs').then(m => m.ArtistSongs)
    },
    {
        path: 'songs/:id',
        loadComponent: () =>
            import('./features/songs/song-detail/song-detail').then(m => m.SongDetailComponent)
    },
    {
        path: 'songs/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/songs/song-edit/song-edit').then(m => m.SongEditComponent)
    },
    {
        path: 'analyze',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/songs/song-analyze/song-analyze').then(m => m.SongAnalyzeComponent)
    },
    {
        path: 'setlists/new',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/setlists/setlist-create/setlist-create').then(m => m.SetlistCreateComponent)
    },
    {
        path: 'setlists/:id',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/setlists/setlist-detail/setlist-detail').then(m => m.SetlistDetailComponent)
    },
    {
        path: 'tuner',
        loadComponent: () =>
            import('./features/tuner/tuner').then(m => m.TunerComponent)
    },
    {
        path: 'chords',
        loadComponent: () =>
            import('./features/chords/chords').then(m => m.ChordsComponent)
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/register/register').then(m => m.RegisterComponent)
    },
    {
        path: 'profile/:username',
        loadComponent: () =>
            import('./features/profile/profile').then(m => m.ProfileComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () =>
            import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmailComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];