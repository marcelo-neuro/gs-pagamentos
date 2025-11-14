import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginDTO } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.less']
})
export class LoginComponent {
  credenciais: LoginDTO = {
    email: '',
    senha: ''
  };

  erro: string = '';
  carregando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Se já estiver autenticado, redirecionar para home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    if (!this.credenciais.email || !this.credenciais.senha) {
      this.erro = 'Por favor, preencha todos os campos';
      return;
    }

    this.erro = '';
    this.carregando = true;

    this.authService.login(this.credenciais).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        if (err.status === 401) {
          this.erro = 'Email ou senha inválidos';
        } else {
          this.erro = 'Erro ao fazer login. Tente novamente.';
        }
        this.carregando = false;
      }
    });
  }
}
