export interface Pessoal {
  id: number;
  nome: string;
  numeroDoCartao: number;
  formaDePagamentoId: number;
  validade: string;
  codigoDeSeguranca: number;
  transactionDate: string;
  valor: number;
  descricao: string;
}

export interface PagamentoView {
  id: number;
  valor: number;
  dataTransacao: string;
  descricao: string;
  nomeCliente: string;
  emailCliente: string;
  telefoneCliente: string;
  clienteId: number;
  cartaoId: number;
}
