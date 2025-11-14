import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface RegistroDTO {
  nome: string;
  email: string;
  senha: string;
  empresa: string;
  setor: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface AuthResponseDTO {
  token: string;
  tipo: string;
  usuarioId: number;
  nome: string;
  email: string;
  empresa: string;
  setor: string;
}

export interface UsuarioInfo {
  usuarioId: number;
  nome: string;
  email: string;
  empresa: string;
  setor: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<UsuarioInfo | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  registrar(dados: RegistroDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/registro`, dados).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(credenciais: LoginDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UsuarioInfo | null {
    return this.currentUserSubject.value;
  }

  private handleAuthResponse(response: AuthResponseDTO): void {
    localStorage.setItem('token', response.token);
    
    const usuario: UsuarioInfo = {
      usuarioId: response.usuarioId,
      nome: response.nome,
      email: response.email,
      empresa: response.empresa,
      setor: response.setor
    };
    
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  private getStoredUser(): UsuarioInfo | null {
    const userJson = localStorage.getItem('usuario');
    return userJson ? JSON.parse(userJson) : null;
  }
}
