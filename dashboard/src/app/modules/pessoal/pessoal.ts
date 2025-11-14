import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PessoalService } from '../../services/pessoal/pessoal';
import { Pessoal } from './models/pessoal.interface';
import { AppModule } from '../../app';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-pessoal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pessoal.html',
  styleUrls: ['./pessoal.less'],
})
export class PessoalComponent {
  constructor(
    private pessoalService: PessoalService,
    public global: AppModule,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      if (this.global.selecionou) {
        this.telefone = this.global.telefone;
        this.email = this.global.email;
        this.idTrans = this.global.idTransacao;
        this.filtrarDados(this.global.idCliente);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  telefone: any;
  email: any;
  vlCompra: any;
  nomeUsur: any;
  nCartaoUsur: any;
  cvv: any;
  validade: any;
  tpPag: any;
  idCliente: any;
  idTrans: any;
  transacao: any;

  mensagem: string = '';

  nOperacoes: number = 0;
  totalTransacoes: number = 0;

  dadosCliente: any = [];
  listaCartoes: any = [];
  listaTransacoes: any = [];

  mostraInfos = false;

  listaFiltro: any;

  public limparInfo() {
    this.mostraInfos = false;
    this.email = '';
    this.telefone = '';
  }

  public clicouBotao(telefone?: any, email?: any) {
    this.global.selecionou = false;
    this.filtrarDados(null, telefone, email);
  }

  public async filtrarDados(id?: any, telefone?: any, email?: any) {
    this.pessoalService.pegarCliente(id, telefone, email).subscribe({
      next: (dados) => {
        this.dadosCliente = dados;
        // console.log(this.dadosCliente);

        if (this.global.selecionou === true) {
          console.log('clicou');

          this.obterPagamentoUnico(this.idTrans);
        } else {
          this.obterCartoes(this.dadosCliente.id);
        }
      },
      error: (erro) => {
        console.error('Erro ao buscar dados:', erro);
      },
    });
  }

  public async obterCartoes(id: number) {
    await this.pessoalService.pegarCartoes(this.dadosCliente.id).subscribe({
      next: (dados) => {
        this.listaCartoes = dados;
        // console.log(this.listaCartoes);
      },
      error: (erro) => {
        console.error('Erro ao buscar dados:', erro);
      },
    });

    await this.obterTransacoes(this.dadosCliente.id);
  }

  public async obterTransacoes(id: number) {
    this.totalTransacoes = 0
    this.pessoalService.pegarPagamentos(id).subscribe({
      next: (dados) => {
        this.listaTransacoes = dados;
        console.log(this.listaTransacoes);

        for (let i = 0; i < this.listaTransacoes.length; i++) {
          this.totalTransacoes += this.listaTransacoes[i].valor;
        }
        this.mostraInfos = true;
      },
      error: (erro) => {
        console.error('Erro ao buscar dados:', erro);
      },
    });
  }

  public async obterPagamentoUnico(id: number) {
    this.pessoalService.pegarPagamentoUnico(id).subscribe({
      next: (texto: string) => {
        this.transacao = this.parseTransacao(texto);
        this.mostraInfos = true;
      },

      error: (erro) => {
        console.error('Erro ao buscar dados:', erro);
      },
    });
  }

  public parseTransacao(texto: string) {
    const partes = texto.split('|');

    const cliente = partes[0].split(':')[1].trim();

    const cartaoRaw = partes[1].split(':')[1].trim();
    const cartaoMatch = cartaoRaw.match(/(\*{3,4}\d{4})\s*\((\w+)\)/);

    const cartao = cartaoMatch?.[1] ?? '';
    const tipoCartao = cartaoMatch?.[2] ?? '';

    const valorTexto = partes[2].split(':')[1].replace('R$', '').replace(',', '.').trim();
    const valor = parseFloat(valorTexto);

    const data = partes[3].split(':')[1].trim();

    return {
      cliente,
      cartao,
      tipoCartao,
      valor,
      data,
    };
  }

  public formatarDataTransacao(iso: string): string {
  const data = new Date(iso);

  if (isNaN(data.getTime())) return 'Data inválida';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

}
