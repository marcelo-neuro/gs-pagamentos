import { Component, inject } from '@angular/core';
import { CardComponent } from './components/card/card';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../services/home/home';
import { Pessoal, PagamentoView } from '../pessoal/models/pessoal.interface';
import { AppModule } from '../../app';
import { Router } from '@angular/router';
import { DashboardContextService } from '../../services/chatbot/dashboard-context.service';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'dash-home',
  imports: [CardComponent, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.less',
})
export class HomeComponet {
  private dashboardContext = inject(DashboardContextService);
  
  constructor(
    private homeService: HomeService, 
    public global: AppModule, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.obterDados();
    } else {
      this.router.navigate(['/login']);
    }
  }

  pessoal: any[] = [];
  listaTransRecentes: any = []

  transRecente: number = 0;
  maiorTransacao: number = 0;
  totalTransacoes: number = 0;
  totalTransacoesFeitas: number = 0;

  async obterDados() {
    this.homeService.obterDados().subscribe({
      next: (dados: PagamentoView[]) => {
        this.pessoal = dados;

        this.totalTransacoesFeitas = this.pessoal.length;
        this.maiorTransacao = this.pessoal[1]?.valor || 0;

        const maisRecente = this.pessoal.reduce((maisNova, atual) =>
          new Date(atual.dataTransacao) > new Date(maisNova.dataTransacao) ? atual : maisNova
        );

        this.transRecente = maisRecente?.valor || 0;

        for (let i = 0; i < this.pessoal.length; i++) {
          this.totalTransacoes += this.pessoal[i].valor;

          if (this.maiorTransacao < this.pessoal[i].valor) {
            this.maiorTransacao = this.pessoal[i].valor;
          }
        }
        
        this.listarTransRecentes();
        this.updateDashboardContext();
      },
      error: (erro) => {
        console.error('Erro ao buscar dados:', erro);
      },
    });
  }

  public selecionarUsuario(id:number, telefone: string, email: string, idPagamento: number) {
    this.global.telefone = telefone;
    this.global.email = email
    this.global.idCliente = id;
    this.global.idTransacao = idPagamento;
    this.global.selecionou = true;

    this.router.navigate(['/pessoal']);
  }

  async listarTransRecentes(){
    this.listaTransRecentes = this.pessoal.map((pagamento: PagamentoView) => ({
      id: pagamento.id,
      valor: pagamento.valor,
      dataTransacao: this.formatDateToBR(pagamento.dataTransacao),
      descricao: pagamento.descricao,
      nome: pagamento.nomeCliente,
      telefone: pagamento.telefoneCliente,
      email: pagamento.emailCliente,
      idCliente: pagamento.clienteId
    }));
    
    console.log(this.listaTransRecentes);
  }

  public formatarParaReal(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  public formatarData(dataISO: string): string {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  public formatDateToBR(isoDate: string): string {
  const date = new Date(isoDate);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa em 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

  // Atualizar contexto do dashboard para a Luma
  private updateDashboardContext(): void {
    // Atualizar estatísticas
    this.dashboardContext.updateStats({
      transRecente: this.transRecente,
      maiorTransacao: this.maiorTransacao,
      totalTransacoes: this.totalTransacoes,
      totalTransacoesFeitas: this.totalTransacoesFeitas
    });

    // Atualizar transações
    this.dashboardContext.updateTransactions(this.listaTransRecentes);

    // Atualizar clientes (agrupados por clienteId)
    const clientesUnicos = this.listaTransRecentes.reduce((acc: any[], trans: any) => {
      if (!acc.find((c: any) => c.id === trans.idCliente)) {
        acc.push({
          id: trans.idCliente,
          nome: trans.nome,
          email: trans.email,
          telefone: trans.telefone,
          transacoes: this.listaTransRecentes.filter((t: any) => t.idCliente === trans.idCliente)
        });
      }
      return acc;
    }, []);
    
    this.dashboardContext.updateClients(clientesUnicos);
  }
}

