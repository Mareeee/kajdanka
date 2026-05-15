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
        path: 'songs/:id',
        loadComponent: () =>
            import('./features/songs/song-detail/song-detail').then(m => m.SongDetailComponent)
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
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/profile/profile').then(m => m.ProfileComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];