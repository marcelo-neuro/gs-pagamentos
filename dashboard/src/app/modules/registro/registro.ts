import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegistroDTO } from '../../services/auth/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.less']
})
export class RegistroComponent {
  dados: RegistroDTO = {
    nome: '',
    email: '',
    senha: '',
    empresa: '',
    setor: ''
  };

  confirmarSenha: string = '';
  erro: string = '';
  carregando: boolean = false;

  setoresDisponiveis = [
    'Jurídico',
    'Financeiro',
    'Recursos Humanos (RH)',
    'Tecnologia da Informação (TI)',
    'Comercial',
    'Marketing',
    'Operações',
    'Administrativo',
    'Contabilidade',
    'Compliance',
    'Outro'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Se já estiver autenticado, redirecionar para home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  registrar(): void {
    // Validações
    if (!this.dados.nome || !this.dados.email || !this.dados.senha || 
        !this.dados.empresa || !this.dados.setor) {
      this.erro = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.dados.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem';
      return;
    }

    if (this.dados.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.dados.email)) {
      this.erro = 'Email inválido';
      return;
    }

    this.erro = '';
    this.carregando = true;

    this.authService.registrar(this.dados).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erro no registro:', err);
        if (err.status === 400) {
          this.erro = err.error?.message || 'Email já cadastrado';
        } else {
          this.erro = 'Erro ao criar conta. Tente novamente.';
        }
        this.carregando = false;
      }
    });
  }
}
