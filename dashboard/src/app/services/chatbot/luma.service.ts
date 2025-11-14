import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardContextService } from './dashboard-context.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Função helper para acessar variáveis de ambiente
function getEnvVariable(key: string): string {
  if (typeof window !== 'undefined' && (window as any)[key]) {
    return (window as any)[key];
  }
  // Fallback para build time
  return '';
}

@Injectable({
  providedIn: 'root'
})
export class LumaService {
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent';
  // Chave da API do Google AI Studio
  // Para produção, mova para environment.ts
  private readonly API_KEY = 'AIzaSyBIRcrtcjzAOA2xm3_OV_dSo5BLgHdB-Dc';
  
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  public chatHistory$ = this.chatHistorySubject.asObservable();

  private systemContext = `
    Você é Luma, uma assistente virtual inteligente do Smart HAS (Sistema de Pagamentos).
    Você tem acesso aos dados do dashboard em tempo real e pode consultar:
    
    📊 CAPACIDADES:
    - Consultar transações de pagamentos
    - Buscar informações de clientes específicos
    - Calcular estatísticas e análises financeiras
    - Identificar padrões de gastos
    - Fornecer insights sobre transações
    - Responder perguntas sobre valores, datas e clientes
    
    💡 INSTRUÇÕES:
    - Use os dados do contexto fornecido para responder com precisão
    - Quando o usuário perguntar sobre um cliente, busque pelo nome exato
    - Forneça valores sempre em formato brasileiro (R$)
    - Seja analítica mas conversacional
    - Se não encontrar algo, sugira alternativas
    - Apresente números de forma clara e formatada
    
    🎯 EXEMPLOS DE PERGUNTAS QUE VOCÊ PODE RESPONDER:
    - "Quanto Bruno Souza gastou?"
    - "Qual foi a maior transação?"
    - "Mostre as transações acima de R$ 500"
    - "Quem são os clientes que mais gastam?"
    - "Quantas transações foram feitas em julho?"
  `;

  constructor(private http: HttpClient) {
    this.initializeChat();
  }

  private dashboardContext = inject(DashboardContextService);

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: 'Olá! Sou a Luma, sua assistente virtual do Smart HAS. Como posso ajudá-lo hoje? 😊',
      timestamp: new Date()
    };
    this.chatHistorySubject.next([welcomeMessage]);
  }

  public sendMessage(userMessage: string, contextData?: any): Observable<ChatMessage> {
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next([...currentHistory, userChatMessage]);

    // Verificar se a chave está configurada
    if (!this.API_KEY || this.API_KEY.length < 30) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '⚠️ A Luma precisa de uma chave válida da API do Google Gemini.\n\nPara ativá-la:\n1. Acesse https://aistudio.google.com/apikey\n2. Gere uma nova chave gratuita\n3. Configure em luma.service.ts',
        timestamp: new Date()
      };
      this.chatHistorySubject.next([...this.chatHistorySubject.value, errorMessage]);
      return of(errorMessage);
    }

    // Adicionar contexto do dashboard automaticamente
    const dashboardContext = this.dashboardContext.getFormattedContext();
    const enhancedContextData = {
      ...contextData,
      dashboardData: dashboardContext,
      stats: this.dashboardContext.getStats(),
      recentTransactions: this.dashboardContext.getTransactions().slice(0, 20)
    };

    return this.callGeminiAPI(userMessage, enhancedContextData).pipe(
      map(response => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        const updatedHistory = this.chatHistorySubject.value;
        this.chatHistorySubject.next([...updatedHistory, assistantMessage]);
        
        return assistantMessage;
      }),
      catchError(error => {
        console.error('Erro ao comunicar com Luma:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: '⚠️ A chave da API do Gemini está inválida ou expirada.\n\nGere uma nova em: https://aistudio.google.com/apikey',
          timestamp: new Date()
        };
        
        const updatedHistory = this.chatHistorySubject.value;
        this.chatHistorySubject.next([...updatedHistory, errorMessage]);
        
        return of(errorMessage);
      })
    );
  }

  private callGeminiAPI(message: string, contextData?: any): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let enhancedPrompt = `${this.systemContext}\n\nUsuário: ${message}`;

    if (contextData) {
      enhancedPrompt += `\n\nContexto adicional (dados do usuário):\n${JSON.stringify(contextData, null, 2)}`;
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }]
    };

    const url = `${this.GEMINI_API_URL}?key=${this.API_KEY}`;

    return this.http.post<any>(url, requestBody, { headers }).pipe(
      map(response => {
        if (response.candidates && response.candidates.length > 0) {
          const content = response.candidates[0].content;
          if (content.parts && content.parts.length > 0) {
            return content.parts[0].text;
          }
        }
        throw new Error('Resposta inválida da API');
      })
    );
  }

  public clearHistory(): void {
    this.initializeChat();
  }

  public getChatHistory(): ChatMessage[] {
    return this.chatHistorySubject.value;
  }

  public generateReport(data: any): Observable<string> {
    const prompt = `
      Com base nos seguintes dados financeiros, gere um relatório em linguagem natural:
      ${JSON.stringify(data, null, 2)}
      
      Inclua:
      - Resumo geral das transações
      - Principais categorias de gastos
      - Tendências observadas
      - Sugestões de otimização
    `;

    return this.callGeminiAPI(prompt);
  }

  public getOptimizationSuggestions(transactionData: any): Observable<string> {
    const prompt = `
      Analise os seguintes dados de transações e forneça sugestões específicas de otimização:
      ${JSON.stringify(transactionData, null, 2)}
      
      Forneça:
      - Áreas onde há oportunidades de economia
      - Alertas sobre gastos elevados
      - Recomendações personalizadas
    `;

    return this.callGeminiAPI(prompt);
  }

  // Métodos especializados para consultas do dashboard

  public searchClient(clientName: string): Observable<string> {
    const client = this.dashboardContext.findClientByName(clientName);
    
    if (!client) {
      return of(`Não encontrei nenhum cliente com o nome "${clientName}". Os clientes disponíveis são: ${this.dashboardContext.getClients().map(c => c.nome).join(', ')}`);
    }

    const stats = this.dashboardContext.getClientStats(client.id);
    const prompt = `
      O usuário perguntou sobre o cliente "${clientName}".
      
      Dados do cliente:
      - Nome: ${client.nome}
      - Email: ${client.email}
      - Telefone: ${client.telefone}
      - Valor médio de compra: R$ ${client.valorMedioCompra.toFixed(2)}
      - Total de transações: ${stats.totalTransactions}
      - Valor total gasto: R$ ${stats.totalAmount.toFixed(2)}
      - Média de gastos: R$ ${stats.averageAmount.toFixed(2)}
      - Maior transação: R$ ${stats.maxTransaction.toFixed(2)}
      - Menor transação: R$ ${stats.minTransaction.toFixed(2)}
      
      Últimas transações:
      ${stats.transactions.slice(0, 5).map((t: any) => 
        `- R$ ${t.valor.toFixed(2)} em ${t.dataTransacao}`
      ).join('\n')}
      
      Forneça uma resposta conversacional e útil sobre este cliente.
    `;

    return this.callGeminiAPI(prompt);
  }

  public analyzeTransactionsByValue(minValue?: number, maxValue?: number): Observable<string> {
    const allTransactions = this.dashboardContext.getTransactions();
    let filtered = allTransactions;
    
    if (minValue !== undefined || maxValue !== undefined) {
      filtered = this.dashboardContext.getTransactionsByValueRange(
        minValue || 0, 
        maxValue || Infinity
      );
    }

    const prompt = `
      Analisar transações${minValue || maxValue ? ` entre R$ ${minValue || 0} e R$ ${maxValue || 'infinito'}` : ''}:
      
      Total de transações: ${filtered.length}
      Valor total: R$ ${filtered.reduce((sum, t) => sum + t.valor, 0).toFixed(2)}
      
      Transações encontradas:
      ${filtered.slice(0, 10).map((t, i) => 
        `${i + 1}. ${t.nome} - R$ ${t.valor.toFixed(2)} em ${t.dataTransacao}`
      ).join('\n')}
      
      Forneça uma análise clara e insights sobre essas transações.
    `;

    return this.callGeminiAPI(prompt);
  }

  public getTopClients(limit: number = 5): Observable<string> {
    const clients = this.dashboardContext.getClients()
      .map(c => ({
        ...c,
        totalGasto: c.transacoes.reduce((sum: number, t: any) => sum + t.valor, 0)
      }))
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, limit);

    const prompt = `
      Top ${limit} clientes que mais gastaram:
      
      ${clients.map((c, i) => 
        `${i + 1}. ${c.nome}
           - Total gasto: R$ ${c.totalGasto.toFixed(2)}
           - Número de transações: ${c.transacoes.length}
           - Ticket médio: R$ ${(c.totalGasto / c.transacoes.length).toFixed(2)}
           - Email: ${c.email}`
      ).join('\n\n')}
      
      Forneça uma análise destacando os principais insights sobre esses clientes.
    `;

    return this.callGeminiAPI(prompt);
  }
}
