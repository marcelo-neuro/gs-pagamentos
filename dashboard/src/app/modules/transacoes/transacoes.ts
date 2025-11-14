import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppModule } from '../../app';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-transacoes',
  imports: [],
  templateUrl: './transacoes.html',
  styleUrl: './transacoes.less'
})
export class TransacoesComponent {
  constructor(
    private router: Router, 
    public global: AppModule,
    private authService: AuthService
  ){}

  ngOnInit(){
    if(!this.authService.isAuthenticated()){
      this.deslogar()
    }
  }

  voltaHome(){
    this.router.navigate(["/home"])
  }

  deslogar(){
    this.authService.logout()
  }
}
