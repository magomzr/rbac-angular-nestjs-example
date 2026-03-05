import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'elements',
    loadComponent: () =>
      import('./components/elements/elements.component').then((m) => m.ElementsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./components/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  { path: '', redirectTo: 'elements', pathMatch: 'full' },
  { path: '**', redirectTo: 'elements' },
];
