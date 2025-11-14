import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, UsuarioInfo } from '../../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dash-navbar',
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.less'
})
export class Navbar {
  usuario: UsuarioInfo | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
