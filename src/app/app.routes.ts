import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ResetPasswordPage } from './pages/reset-password/reset-password.page';
import { authGuard } from './guards/auth.guard';
import { UserDashboardPage } from './pages/user-dashboard/user-dashboard.page';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'reset-password', component: ResetPasswordPage },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: UserDashboardPage,
  },
  {
  path: 'create-task',
  loadComponent: () => import('./pages/create-task/create-task.page').then(m => m.CreateTaskPage),
},
];
