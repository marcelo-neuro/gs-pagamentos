import { Routes } from '@angular/router';
import { HomeComponet } from './modules/home/home'
import { PessoalComponent } from './modules/pessoal/pessoal';
import { TransacoesComponent } from './modules/transacoes/transacoes';
import { LoginComponent } from './modules/login/login';
import { RegistroComponent } from './modules/registro/registro';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'home', component: HomeComponet, canActivate: [AuthGuard] },
    { path: 'pessoal', component: PessoalComponent, canActivate: [AuthGuard] },
    { path: 'transacoes', component: TransacoesComponent, canActivate: [AuthGuard] }
];
