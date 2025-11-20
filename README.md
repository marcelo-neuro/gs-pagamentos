# 🚀 SmartSector - Sistema Multi-Tenant de Pagamentos com IA

Sistema completo de gerenciamento de pagamentos com **autenticação JWT**, **arquitetura multi-tenant** e **assistente virtual com IA (Luma)**, desenvolvido em **Spring Boot + Angular + React**.

## 🎯 Visão Geral do Projeto

**SmartSector** é uma plataforma moderna de pagamentos que permite múltiplas empresas gerenciarem suas transações de forma isolada e segura, com integração de inteligência artificial para análise contextualizada.

### 🔐 Principais Recursos Implementados

✅ **Autenticação JWT completa**
- Login e registro de usuários com BCrypt
- Tokens JWT com expiração de 24h
- Middleware de autenticação em todas as rotas protegidas
- Interceptors automáticos (Angular e React)

✅ **Arquitetura Multi-Tenant**
- Cada usuário registrado representa uma empresa/setor
- Isolamento total de dados entre tenants (por `usuarioId`)
- Cliente, Cartão e Pagamento vinculados ao usuário autenticado

✅ **API REST Enriquecida**
- **PagamentoViewDTO**: Endpoint `/pagamentos` retorna dados completos (nome, email, telefone do cliente + descrição)
- Eliminação de múltiplas requisições no frontend (3 → 1)
- Validações robustas com Jakarta Bean Validation

✅ **Assistente Virtual Luma (IA)**
- Integração com Google Gemini 2.5 Flash
- Contexto em tempo real do dashboard (transações, clientes, estatísticas)
- Consultas em linguagem natural sobre dados financeiros
- Análises e insights personalizados por empresa/setor

✅ **Dashboards Completos**
- **Angular Dashboard**: Visualização desktop com gráficos e tabelas
- **React Mobile**: App responsivo com cadastro de clientes e cartões
- Sincronização automática entre plataformas via JWT compartilhado

## 🆕 Novidades da Última Entrega

### Backend (Spring Boot)

#### 1. Sistema de Autenticação JWT
```java
// Entidade Usuario com UserDetails
@Entity
public class Usuario implements UserDetails {
    private String nome;
    private String email;
    private String senha; // BCrypt
    private String empresa;
    private String setor;
    private LocalDateTime dataCadastro;
    private Boolean ativo;
}
```

**Endpoints:**
```http
POST /auth/registro
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "empresa": "TechCorp",
  "setor": "TI"
}

POST /auth/login
{
  "email": "joao@empresa.com",
  "senha": "senha123"
}
→ Retorna JWT + dados do usuário

GET /auth/validate
→ Valida token JWT atual
```

#### 2. Multi-Tenancy
Todas as entidades principais foram vinculadas ao usuário:

```java
@Entity
public class Pagamento {
    @ManyToOne
    private Usuario usuario; // Isolamento por tenant
    // ... outros campos
}
```

#### 3. PagamentoViewDTO
Novo DTO que retorna **dados completos** em uma única chamada:

```json
{
  "id": 1,
  "valor": 579.56,
  "dataTransacao": "2024-12-28T14:30:00",
  "descricao": "Plano MindMatch Premium",
  "nomeCliente": "Bruno Souza",
  "emailCliente": "bruno.souza579@emailaleatorio.com",
  "telefoneCliente": "(11) 998887304",
  "clienteId": 1,
  "cartaoId": 1
}
```

**Antes:** 3 requisições (pagamentos, clientes, cartões)  
**Agora:** 1 requisição com tudo

#### 4. Segurança
- **CORS** configurado para localhost:3000/4200/5173
- **CSRF** desabilitado (API stateless)
- **Sessions** stateless (JWT puro)
- **BCryptPasswordEncoder** com salt automático
- Logging detalhado de autenticação (SLF4J)

### Frontend Angular (Dashboard)

#### Novos Serviços e Guards
```typescript
// AuthService com JWT
login(credenciais): Observable<AuthResponseDTO>
registrar(dados): Observable<AuthResponseDTO>
logout(): void
isAuthenticated(): boolean
getCurrentUser(): UsuarioInfo

// AuthGuard protegendo rotas
canActivate(): boolean

// AuthInterceptor (HttpInterceptorFn)
// Adiciona automaticamente: Authorization: Bearer {token}
```

#### Telas Implementadas
- **Login** (`/login`): Autenticação com feedback visual
- **Registro** (`/registro`): Cadastro com empresa/setor
- **Dashboard** (`/`): Indicadores + tabela com dados completos
- **Navbar**: Exibe nome, empresa, setor do usuário logado

#### Luma - Assistente Virtual com IA
```typescript
// Integração Google Gemini 2.5 Flash
sendMessage(userMessage: string): Observable<ChatMessage>

// Métodos especializados
searchClient(clientName: string)
analyzeTransactionsByValue(min, max)
getTopClients(limit: number)
generateReport(data)
```

**Contexto Automático:**
- Estatísticas em tempo real (transRecente, maiorTransacao, totalTransacoes)
- Últimas 20 transações
- Lista completa de clientes

### Frontend React (Mobile)

#### Telas Principais
1. **LoginScreen**: Autenticação JWT
2. **RegisterScreen**: Cadastro com nome, email, empresa, setor, senha
3. **Tabs de Cadastro**:
   - ➕ **Novo Cliente**: nome, email, telefone
   - 💳 **Novo Cartão**: número, CVV, tipo, vencimento, clienteId
   - 📊 **Indicadores**: Estatísticas e gráficos

#### Recursos
- `localStorage` para persistência de token/usuário
- Estado `dataLoaded` para prevenir loops infinitos
- Funções `saveCliente()` e `saveCartao()` com validação
- Feedback visual de erros e sucessos

## 🔧 Tecnologias Utilizadas

### Backend
- **Spring Boot 3.5.5** + Java 17
- **Spring Security 6** com JWT
- **JJWT 0.12.3** (io.jsonwebtoken)
- **JPA/Hibernate** com Oracle/H2
- **Jakarta Bean Validation**
- **Lombok** (redução de boilerplate)

### Frontend Dashboard (Angular)
- **Angular 20.2.0** (standalone components)
- **RxJS** para programação reativa
- **HttpClient** com interceptors
- **Google Gemini API** para IA

### Frontend Mobile (React)
- **React 18.2.0** + Hooks
- **Vite** (build rápido)
- **Fetch API** para requisições
- **CSS moderno** responsivo

### Banco de Dados
- **Oracle** (produção) com PL/SQL
- **H2** (desenvolvimento) com persistência em arquivo
- **Hibernate** para ORM

## 🌐 API Endpoints Completa

### Autenticação (Públicas)
```http
POST /auth/registro
POST /auth/login
GET  /auth/validate
```

### CRUD Principal (Autenticadas - JWT)
```http
GET    /pagamentos           # Lista com dados completos do cliente
POST   /pagamentos           # Criar novo pagamento
PUT    /pagamentos/{id}      # Atualizar pagamento
DELETE /pagamentos/{id}      # Excluir pagamento

GET    /clientes             # Listar clientes do usuário logado
POST   /clientes             # Criar novo cliente
GET    /clientes/{id}        # Buscar cliente por ID

GET    /cartoes              # Listar cartões do usuário logado
POST   /cartoes              # Criar novo cartão
GET    /cartoes/{id}         # Buscar cartão por ID
```

### Indicadores Oracle (PL/SQL)
```http
GET  /indicadores/ticket-medio/{clienteId}
GET  /indicadores/descricao-pagamento/{pagamentoId}
POST /indicadores/registrar-alertas?limite={valor}
GET  /indicadores/alertas
GET  /indicadores/relatorio-consumo/{clienteId}
```

## 🚀 Como Executar

### 1. Backend (Spring Boot)

**Desenvolvimento (H2):**
```bash
cd entrega-6
set SPRING_PROFILES_ACTIVE=test
mvnw.cmd spring-boot:run
```

**Produção (Oracle):**
```bash
set ORACLE_USER=seu_usuario
set ORACLE_PASSWORD=sua_senha
set SPRING_PROFILES_ACTIVE=prod
mvnw.cmd spring-boot:run
```

**Usuário de teste (H2):**
- Email: `luiz@email.com`
- Senha: `123456`

### 2. Dashboard Angular
```bash
cd dashboard
npm install
ng serve --port 4200
# Acesse: http://localhost:4200
```

**Configure a Luma (opcional):**
1. Obtenha chave em: https://aistudio.google.com/apikey
2. Edite `luma.service.ts` → `API_KEY`

### 3. Mobile React
```bash
cd mobile
npm install
npm run dev
# Acesse: http://localhost:5173
```

## 📁 Estrutura do Projeto

```
entrega-6/
├── src/main/java/com/mindmatch/pagamento/
│   ├── controller/
│   │   ├── AuthController.java          # Login/Registro
│   │   ├── PagamentoController.java     # CRUD com PagamentoViewDTO
│   │   ├── ClienteController.java
│   │   └── CartaoController.java
│   ├── service/
│   │   ├── PagamentoService.java        # getAllWithClientData()
│   │   ├── CustomUserDetailsService.java
│   │   └── ...
│   ├── security/
│   │   ├── JwtService.java              # Geração/validação JWT
│   │   ├── JwtAuthenticationFilter.java # OncePerRequestFilter
│   │   └── SecurityConfiguration.java   # Configuração Spring Security
│   ├── entities/
│   │   ├── Usuario.java                 # implements UserDetails
│   │   ├── Pagamento.java               # @ManyToOne usuario
│   │   ├── Cliente.java
│   │   └── Cartao.java
│   ├── dto/
│   │   ├── PagamentoViewDTO.java        # DTO com dados do cliente
│   │   ├── RegistroDTO.java
│   │   └── AuthResponseDTO.java
│   └── config/
│       └── CorsConfig.java              # CORS localhost:3000/4200/5173
├── dashboard/src/app/
│   ├── modules/
│   │   ├── login/                       # Tela de login
│   │   ├── registro/                    # Tela de registro
│   │   └── home/                        # Dashboard principal
│   ├── services/
│   │   ├── auth/auth.ts                 # AuthService
│   │   ├── chatbot/luma.service.ts      # Integração Gemini
│   │   └── chatbot/dashboard-context.ts
│   ├── guards/
│   │   └── auth.guard.ts                # Proteção de rotas
│   └── interceptors/
│       └── auth.interceptor.ts          # Adiciona JWT
└── mobile/src/
    └── App.jsx                          # App completo (Login + Cadastros)
```
<img width="602" height="440" alt="image" src="https://github.com/user-attachments/assets/3db82ac5-c0a4-47f5-83de-1f3384b87305" />



## 🎯 Diferenciais Técnicos

✅ **Zero configuração manual de headers**: Interceptors automáticos  
✅ **Isolamento total de dados**: Multi-tenancy nativo  
✅ **Performance otimizada**: 1 requisição vs 3 anteriores  
✅ **IA Contextualizada**: Luma analisa dados específicos do tenant  
✅ **Segurança robusta**: JWT + BCrypt + validações  
✅ **Banco persistente**: H2 em arquivo (dados não se perdem)  
✅ **Cross-platform**: Mesmos dados em Angular e React



