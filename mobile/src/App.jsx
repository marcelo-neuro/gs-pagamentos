import React, { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) || (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080'

function tipoCartaoLabel(tipo){
  if(!tipo) return '—'
  const t = String(tipo).toUpperCase()
  return t === 'CREDITO' ? 'Crédito' : t === 'DEBITO' ? 'Débito' : 'Outro'
}

function LoginScreen({ onLogin, onSwitchToRegister, error }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className="page center">
      <div className="card login-card">
        <h2>SmartSector</h2>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Sistema de Análise Inteligente por Setor</p>
        {error && <div className="alert error">{error}</div>}
        <div className="form-row">
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div className="form-row">
          <button onClick={()=>onLogin(email, password)}>Entrar</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#666', fontSize: 14 }}>Não tem uma conta? </span>
          <a href="#" onClick={(e)=>{ e.preventDefault(); onSwitchToRegister(); }} style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Cadastre-se</a>
        </div>
      </div>
    </div>
  )
}

function RegisterScreen({ onRegister, onSwitchToLogin, error }){
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [setor, setSetor] = useState('')
  
  const setoresDisponiveis = [
    'Jurídico', 'Financeiro', 'Recursos Humanos (RH)', 'Tecnologia da Informação (TI)',
    'Comercial', 'Marketing', 'Operações', 'Administrativo', 'Contabilidade', 'Compliance', 'Outro'
  ]

  const handleRegister = () => {
    if(!nome || !email || !senha || !empresa || !setor){
      alert('Por favor, preencha todos os campos')
      return
    }
    if(senha !== confirmarSenha){
      alert('As senhas não coincidem')
      return
    }
    if(senha.length < 6){
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }
    onRegister({ nome, email, senha, empresa, setor })
  }

  return (
    <div className="page center">
      <div className="card login-card" style={{ maxWidth: 500 }}>
        <h2>SmartSector</h2>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>Crie sua conta e comece a analisar seus dados</p>
        {error && <div className="alert error">{error}</div>}
        <div className="form-row">
          <input placeholder="Nome Completo" value={nome} onChange={e=>setNome(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Empresa" value={empresa} onChange={e=>setEmpresa(e.target.value)} />
        </div>
        <div className="form-row">
          <select value={setor} onChange={e=>setSetor(e.target.value)} style={{ padding: '12px 16px', fontSize: 14 }}>
            <option value="">Selecione seu setor</option>
            {setoresDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <input placeholder="Senha (mínimo 6 caracteres)" type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
        </div>
        <div className="form-row">
          <input placeholder="Confirmar Senha" type="password" value={confirmarSenha} onChange={e=>setConfirmarSenha(e.target.value)} />
        </div>
        <div className="form-row">
          <button onClick={handleRegister}>Criar Conta</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#666', fontSize: 14 }}>Já tem uma conta? </span>
          <a href="#" onClick={(e)=>{ e.preventDefault(); onSwitchToLogin(); }} style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Entrar</a>
        </div>
      </div>
    </div>
  )
}

function PaymentsScreen(props){
  const { pagamentos, clientes, cartoes, message, onLogout, onEdit, onDelete, onSave, form, setForm, loading, editingId, onCancelEdit,
    indicadores, setIndicadores, onGetTicket, onGetDescricao, onRegistrarAlertas, onListarAlertas, onGetRelatorio, apiOffline, onRetry,
    onSaveCliente, onSaveCartao } = props

  // Substitui o toggle por uma aba abaixo
  const [activeTab, setActiveTab] = useState('none') // 'none' | 'indicadores' | 'clientes' | 'cartoes'
  const indicadoresRef = useRef(null)

  // Estados para cadastro de cliente
  const [clienteForm, setClienteForm] = useState({ nome: '', email: '', telefone: '' })

  // Estados para cadastro de cartão
  const [cartaoForm, setCartaoForm] = useState({ numero: '', cvv: '', tipoCartao: '', vencimento: '', clienteId: '' })

  const clienteMap = useMemo(()=>Object.fromEntries((clientes||[]).map(c=>[c.id, c])), [clientes])
  const cartaoMap = useMemo(()=>Object.fromEntries((cartoes||[]).map(c=>[c.id, c])), [cartoes])
  const cartoesFiltrados = useMemo(()=>{
    if(!form.clienteId) return cartoes || []
    return (cartoes||[]).filter(c => String(c.clienteId) === String(form.clienteId))
  }, [cartoes, form.clienteId])

  // define limiteValido para uso nos botões dos Indicadores
  const limiteValido = !!(indicadores && indicadores.limite && !isNaN(parseFloat(indicadores.limite)))

  useEffect(() => {
    if (activeTab === 'indicadores' && indicadoresRef.current) {
      indicadoresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeTab])

  const handleSaveCliente = () => {
    if(!clienteForm.nome || !clienteForm.email || !clienteForm.telefone){
      alert('Preencha todos os campos do cliente')
      return
    }
    onSaveCliente(clienteForm)
    setClienteForm({ nome: '', email: '', telefone: '' })
  }

  const handleSaveCartao = () => {
    if(!cartaoForm.numero || !cartaoForm.cvv || !cartaoForm.tipoCartao || !cartaoForm.vencimento || !cartaoForm.clienteId){
      alert('Preencha todos os campos do cartão')
      return
    }
    onSaveCartao(cartaoForm)
    setCartaoForm({ numero: '', cvv: '', tipoCartao: '', vencimento: '', clienteId: '' })
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Pagamentos</h1>
        <div>
          {/* Removido o botão antigo de Indicadores do header */}
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Banner quando a API estiver offline */}
      {apiOffline && (
        <div className="alert error" style={{ margin: '8px 16px' }}>
          API offline. Inicie o backend e tente novamente.
          <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={onRetry}>Tentar novamente</button>
        </div>
      )}

      {message && <div className={`alert ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

      {/* Conteúdo principal: Lista + Form lado a lado */}
      <div className="content">
        <section className="panel">
          <h3>Lista de pagamentos</h3>
          <ul className="list">
            {pagamentos.map(p => {
              const cli = clienteMap[p.clienteId]
              const car = cartaoMap[p.cartaoId]
              const last4 = car?.numero ? car.numero.slice(-4) : ''
              return (
                <li className="item" key={p.id}>
                  <div>
                    <strong>{cli?.nome || `Cliente #${p.clienteId}`}</strong>
                    <div className="meta">
                      R$ {p.valor} • {tipoCartaoLabel(car?.tipoCartao)} • ****{last4}{p.dataTransacao ? ' • ' + formatDateDisplay(p.dataTransacao) : ''}
                    </div>
                    {p.descricao && <div className="description">{p.descricao}</div>}
                  </div>
                  <div className="actions">
                    <button onClick={()=>onEdit(p)}>Editar</button>
                    <button className="danger" onClick={()=>onDelete(p.id)}>Excluir</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel">
          <h3>{editingId ? 'Editar pagamento' : 'Criar pagamento'}</h3>
          <div className="form">
            <input placeholder="Valor (ex: 99.90)" value={form.valor} onChange={e=>setForm({...form, valor: e.target.value})} />
            <input placeholder="Descrição da compra" value={form.descricao} onChange={e=>setForm({...form, descricao: e.target.value})} maxLength={255} />

            <label style={{ fontSize: 12, color: '#666' }}>Data da transação</label>
            <input type="date" value={form.transactionDate || ''} onChange={e=>setForm({...form, transactionDate: e.target.value})} />

            <div className="form-row" style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Cliente</label>
                <select value={form.clienteId || ''} onChange={e=>setForm({...form, clienteId: e.target.value, cartaoId: ''})}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Cartão</label>
                <select value={form.cartaoId || ''} onChange={e=>setForm({...form, cartaoId: e.target.value})}>
                  <option value="">Selecione um cartão</option>
                  {cartoesFiltrados.map(c => (
                    <option key={c.id} value={c.id}>****{c.numero?.slice(-4)} • {tipoCartaoLabel(c.tipoCartao)} (#{c.id})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={onSave} disabled={loading}>{loading ? 'Enviando...' : (editingId ? 'Salvar' : 'Criar')}</button>
              {editingId && <button className="link" onClick={onCancelEdit}>Cancelar</button>}
            </div>
          </div>
        </section>      {/* Abas abaixo do conteúdo */}
      <div className="tabs" style={{ margin: '16px' }}>
        <div className="tab-bar" style={{ display: 'flex', gap: 8, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
          <button
            className={activeTab === 'clientes' ? 'tab active' : 'tab'}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: activeTab === 'clientes' ? '#28a745' : '#fff',
              color: activeTab === 'clientes' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(activeTab === 'clientes' ? 'none' : 'clientes')}
          >
            ➕ Novo Cliente
          </button>
          <button
            className={activeTab === 'cartoes' ? 'tab active' : 'tab'}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: activeTab === 'cartoes' ? '#17a2b8' : '#fff',
              color: activeTab === 'cartoes' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(activeTab === 'cartoes' ? 'none' : 'cartoes')}
          >
            💳 Novo Cartão
          </button>
          <button
            className={activeTab === 'indicadores' ? 'tab active' : 'tab'}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: activeTab === 'indicadores' ? '#007bff' : '#fff',
              color: activeTab === 'indicadores' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(activeTab === 'indicadores' ? 'none' : 'indicadores')}
          >
            📊 Indicadores
          </button>
        </div>

          {activeTab === 'clientes' && (
            <section className="panel" style={{ marginTop: 16 }}>
              <h3>Cadastrar Novo Cliente</h3>
              <div className="form">
                <input 
                  placeholder="Nome completo" 
                  value={clienteForm.nome} 
                  onChange={e=>setClienteForm({...clienteForm, nome: e.target.value})} 
                />
                <input 
                  placeholder="Email" 
                  type="email"
                  value={clienteForm.email} 
                  onChange={e=>setClienteForm({...clienteForm, email: e.target.value})} 
                />
                <input 
                  placeholder="Telefone (ex: 11999999999)" 
                  value={clienteForm.telefone} 
                  onChange={e=>setClienteForm({...clienteForm, telefone: e.target.value})} 
                />
                <button onClick={handleSaveCliente} style={{ background: '#28a745' }}>
                  Cadastrar Cliente
                </button>
              </div>
              
              <h4 style={{ marginTop: 24 }}>Clientes Cadastrados</h4>
              <ul className="list">
                {clientes.map(c => (
                  <li className="item" key={c.id}>
                    <div>
                      <strong>{c.nome}</strong>
                      <div className="meta">{c.email} • {c.telefone}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'cartoes' && (
            <section className="panel" style={{ marginTop: 16 }}>
              <h3>Cadastrar Novo Cartão</h3>
              <div className="form">
                <select 
                  value={cartaoForm.clienteId || ''} 
                  onChange={e=>setCartaoForm({...cartaoForm, clienteId: e.target.value})}
                >
                  <option value="">Selecione o cliente dono do cartão</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
                  ))}
                </select>
                <input 
                  placeholder="Número do cartão (16 dígitos)" 
                  value={cartaoForm.numero} 
                  maxLength={16}
                  onChange={e=>setCartaoForm({...cartaoForm, numero: e.target.value.replace(/\D/g, '')})} 
                />
                <input 
                  placeholder="CVV (3 dígitos)" 
                  value={cartaoForm.cvv} 
                  maxLength={3}
                  onChange={e=>setCartaoForm({...cartaoForm, cvv: e.target.value.replace(/\D/g, '')})} 
                />
                <select 
                  value={cartaoForm.tipoCartao || ''} 
                  onChange={e=>setCartaoForm({...cartaoForm, tipoCartao: e.target.value})}
                >
                  <option value="">Selecione o tipo de cartão</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="DEBITO">Débito</option>
                </select>
                <div>
                  <label style={{ fontSize: 12, color: '#666' }}>Data de vencimento</label>
                  <input 
                    type="date"
                    value={cartaoForm.vencimento} 
                    onChange={e=>setCartaoForm({...cartaoForm, vencimento: e.target.value})} 
                  />
                </div>
                <button onClick={handleSaveCartao} style={{ background: '#17a2b8' }}>
                  Cadastrar Cartão
                </button>
              </div>
              
              <h4 style={{ marginTop: 24 }}>Cartões Cadastrados</h4>
              <ul className="list">
                {cartoes.map(c => {
                  const cliente = clienteMap[c.clienteId]
                  return (
                    <li className="item" key={c.id}>
                      <div>
                        <strong>****{c.numero?.slice(-4)}</strong>
                        <div className="meta">
                          {tipoCartaoLabel(c.tipoCartao)} • CVV: {c.cvv} • Validade: {c.vencimento}
                          {cliente && ` • ${cliente.nome}`}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {activeTab === 'indicadores' && (
            <section className="panel" id="indicadores" ref={indicadoresRef}>
              <h3>Indicadores</h3>
              <p style={{ marginTop: -6, color: '#555', fontSize: 13 }}>
                Consulte indicadores calculados no Oracle (PL/SQL). Escolha um item e clique no botão correspondente.
              </p>
              <div className="form" style={{ display: 'grid', gap: 8 }}>
                {/* Ticket médio - selecionar cliente por nome */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select style={{ maxWidth: 300 }} value={indicadores.tmClienteId || ''}
                          onChange={e=>setIndicadores({ ...indicadores, tmClienteId: e.target.value })}>
                    <option value="">Selecione um cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
                    ))}
                  </select>
                  <button onClick={onGetTicket} disabled={!indicadores.tmClienteId}>Ticket médio</button>
                  {indicadores.tmValor != null && !isNaN(Number(indicadores.tmValor)) && (
                    <span style={{ color: '#333' }}>R$ {Number(indicadores.tmValor).toFixed(2)}</span>
                  )}
                </div>
                <small style={{ color: '#777' }}>Calcula a média dos pagamentos do cliente (FN_TICKET_MEDIO_CLIENTE).</small>

                {/* Descrição pagamento - selecionar pagamento por info enriquecida */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select style={{ maxWidth: 520 }} value={indicadores.descId || ''}
                          onChange={e=>setIndicadores({ ...indicadores, descId: e.target.value })}>
                    <option value="">Selecione um pagamento</option>
                    {pagamentos.map(p => {
                      const cli = clienteMap[p.clienteId]
                      const car = cartaoMap[p.cartaoId]
                      const last4 = car?.numero ? car.numero.slice(-4) : ''
                      const data = p.dataTransacao ? formatDateDisplay(p.dataTransacao) : ''
                      const label = `#${p.id} • ${cli?.nome || 'Cliente ?'} • ****${last4} • R$ ${p.valor}${data ? ' • ' + data : ''}`
                      return (
                        <option key={p.id} value={p.id}>{label}</option>
                      )
                    })}
                  </select>
                  <button onClick={onGetDescricao} disabled={!indicadores.descId}>Descrição pagamento</button>
                </div>
                {indicadores.descTexto && <div className="description">{indicadores.descTexto}</div>}
                <small style={{ color: '#777' }}>Retorna uma frase formatada do pagamento (FN_DESCRICAO_PAGAMENTO).</small>

                {/* Registrar / Listar alertas */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input placeholder="Limite (ex: 200)" style={{ maxWidth: 200 }} value={indicadores.limite || ''}
                         onChange={e=>setIndicadores({ ...indicadores, limite: e.target.value })} />
                  <button onClick={onRegistrarAlertas} disabled={!limiteValido}>Registrar alertas</button>
                  <button className="btn-ghost" onClick={onListarAlertas}>Listar alertas</button>
                </div>
                {Array.isArray(indicadores.alertas) && indicadores.alertas.length > 0 && (
                  <ul className="list">
                    {indicadores.alertas.map((a, idx) => (
                      <li className="item" key={idx}>
                        <div>
                          <strong>Alerta #{a.idAlerta}</strong>
                          <div className="meta">Pagamento #{a.idPagamento} • R$ {a.valor} • {new Date(a.dataAlerta).toLocaleString()}</div>
                          <div className="description">{a.mensagem}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <small style={{ color: '#777' }}>Gera alertas para valores acima do limite e lista os alertas (PRC_REGISTRAR_ALERTAS / PRC_LISTAR_ALERTAS).</small>

                {/* Relatório consumo - selecionar cliente por nome */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select style={{ maxWidth: 300 }} value={indicadores.relClienteId || ''}
                          onChange={e=>setIndicadores({ ...indicadores, relClienteId: e.target.value })}>
                    <option value="">Selecione um cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (#{c.id})</option>
                    ))}
                  </select>
                  <button onClick={onGetRelatorio} disabled={!indicadores.relClienteId}>Relatório consumo</button>
                </div>
                {Array.isArray(indicadores.relatorio) && indicadores.relatorio.length > 0 && (
                  <ul className="list">
                    {indicadores.relatorio.map((r, idx) => (
                      <li className="item" key={idx}>
                        <div>
                          <strong>{r.mes}</strong>
                          <div className="meta">Qtd: {r.qtd} • Total: R$ {r.total}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <small style={{ color: '#777' }}>Resumo mensal de pagamentos do cliente (PRC_RELATORIO_CONSUMO_CLIENTE).</small>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDateDisplay(dateStr){
  try{
    const d = new Date(dateStr)
    if(isNaN(d)) return dateStr
    const day = String(d.getDate()).padStart(2,'0')
    const month = String(d.getMonth()+1).padStart(2,'0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }catch(e){ return dateStr }
}

export default function App(){
  const [pagamentos, setPagamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [cartoes, setCartoes] = useState([])
  const [form, setForm] = useState({ valor: '', descricao: '', transactionDate: '', clienteId: '', cartaoId: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario') || 'null'))
  const [editingId, setEditingId] = useState(null)
  const [indicadores, setIndicadores] = useState({ tmClienteId: '', tmValor: null, descId: '', descTexto: '', limite: '', alertas: [], relClienteId: '', relatorio: [] })
  const [apiOffline, setApiOffline] = useState(false)
  const [screen, setScreen] = useState('login') // 'login' | 'register'
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(()=>{ 
    if(authToken && !dataLoaded) {
      fetchInitial()
      setDataLoaded(true)
    }
  }, [authToken, dataLoaded])

  async function fetchInitial(){
    // Buscar pagamentos primeiro (sempre exibir a lista mesmo que clientes/cartoes falhem)
    try{
      const pRes = await fetch(`${API_BASE}/pagamentos`, { headers: headers() })
      if(!pRes.ok) throw new Error('Erro ao buscar pagamentos')
      const p = await pRes.json()
      setPagamentos(p)
      setApiOffline(false)
    }catch(e){ console.error('Erro carregar pagamentos', e); setMessage({ type:'error', text:'Erro ao carregar pagamentos' }); setApiOffline(true) }

    // Buscar clientes e cartões de forma independente
    try{
      const cRes = await fetch(`${API_BASE}/clientes`, { headers: headers() })
      if(cRes.ok){
        const c = await cRes.json(); setClientes(c)
      } else {
        console.warn('Falha ao carregar clientes', cRes.status)
      }
    }catch(e){ console.warn('CORS/erro em clientes', e) }

    try{
      const kRes = await fetch(`${API_BASE}/cartoes`, { headers: headers() })
      if(kRes.ok){
        const k = await kRes.json(); setCartoes(k)
      } else {
        console.warn('Falha ao carregar cartoes', kRes.status)
      }
    }catch(e){ console.warn('CORS/erro em cartoes', e) }
  }

  async function fetchList(){
    try{
      const res = await fetch(`${API_BASE}/pagamentos`, { headers: headers() })
      const data = await res.json()
      setPagamentos(data)
    }catch(e){ console.error('Erro fetch', e); setMessage({ type:'error', text: 'Erro ao buscar pagamentos' }) }
  }

  function headers(){
    const h = { 'Content-Type': 'application/json' }
    if(authToken) h['Authorization'] = `Bearer ${authToken}`
    return h
  }

  async function doLogin(email, senha){
    if(!email || !senha){ setMessage({ type:'error', text: 'Informe email e senha' }); return }
    
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      if(res.ok){
        const data = await res.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
          empresa: data.empresa,
          setor: data.setor
        }))
        setAuthToken(data.token)
        setUsuario({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
          empresa: data.empresa,
          setor: data.setor
        })
        setMessage({ type:'success', text: 'Login realizado com sucesso!' })
      } else {
        const error = await res.json().catch(() => ({}))
        setMessage({ type:'error', text: error.message || 'Email ou senha inválidos' })
      }
    } catch(err) { 
      console.error('Erro ao fazer login', err)
      setMessage({ type:'error', text: 'Erro ao conectar com o servidor' })
    }
  }

  async function doRegister(dados){
    console.log('Tentando registrar:', dados)
    try {
      const res = await fetch(`${API_BASE}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })

      console.log('Resposta do servidor:', res.status, res.statusText)

      if(res.ok){
        const data = await res.json()
        console.log('Dados recebidos:', data)
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
          empresa: data.empresa,
          setor: data.setor
        }))
        setAuthToken(data.token)
        setUsuario({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
          empresa: data.empresa,
          setor: data.setor
        })
        setMessage({ type:'success', text: 'Conta criada com sucesso!' })
        setDataLoaded(false) // Reset para carregar dados após registro
      } else {
        const errorText = await res.text()
        console.error('Erro do servidor:', res.status, errorText)
        try {
          const error = JSON.parse(errorText)
          setMessage({ type:'error', text: error.message || 'Erro ao criar conta' })
        } catch {
          setMessage({ type:'error', text: `Erro ${res.status}: ${errorText || 'Erro ao criar conta'}` })
        }
      }
    } catch(err) { 
      console.error('Erro ao registrar', err)
      setMessage({ type:'error', text: 'Erro ao conectar com o servidor. Verifique se o backend está rodando.' })
    }
  }

  function doLogout(){ 
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setAuthToken(null)
    setUsuario(null)
    setDataLoaded(false)
    setMessage({ type:'success', text: 'Logout realizado' })
  }

  function startEdit(p){
    setEditingId(p.id)
    setForm({
      valor: p.valor != null ? String(p.valor) : '',
      descricao: p.descricao || '',
      transactionDate: p.dataTransacao ? String(p.dataTransacao).slice(0,10) : '',
      clienteId: p.clienteId ? String(p.clienteId) : '',
      cartaoId: p.cartaoId ? String(p.cartaoId) : ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit(){ setEditingId(null); setForm({ valor: '', descricao: '', transactionDate: '', clienteId: '', cartaoId: '' }) }

  async function saveCliente(clienteData){
    setLoading(true)
    setMessage(null)
    try{
      const res = await fetch(`${API_BASE}/clientes`, { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify(clienteData) 
      })
      if(res.ok){
        setMessage({ type:'success', text: 'Cliente cadastrado com sucesso!' })
        // Recarregar lista de clientes
        const cRes = await fetch(`${API_BASE}/clientes`, { headers: headers() })
        if(cRes.ok){
          const c = await cRes.json()
          setClientes(c)
        }
      }else{
        const error = await res.json().catch(() => ({}))
        setMessage({ type:'error', text: error.message || 'Erro ao cadastrar cliente' })
      }
    }catch(e){ 
      console.error('Erro ao salvar cliente', e)
      setMessage({ type:'error', text: 'Erro ao cadastrar cliente' }) 
    }
    setLoading(false)
  }

  async function saveCartao(cartaoData){
    setLoading(true)
    setMessage(null)
    try{
      const payload = {
        numero: cartaoData.numero,
        cvv: cartaoData.cvv,
        tipoCartao: cartaoData.tipoCartao,
        vencimento: cartaoData.vencimento,
        clienteId: Number(cartaoData.clienteId)
      }
      const res = await fetch(`${API_BASE}/cartoes`, { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify(payload) 
      })
      if(res.ok){
        setMessage({ type:'success', text: 'Cartão cadastrado com sucesso!' })
        // Recarregar lista de cartões
        const kRes = await fetch(`${API_BASE}/cartoes`, { headers: headers() })
        if(kRes.ok){
          const k = await kRes.json()
          setCartoes(k)
        }
      }else{
        const error = await res.json().catch(() => ({}))
        setMessage({ type:'error', text: error.message || 'Erro ao cadastrar cartão' })
      }
    }catch(e){ 
      console.error('Erro ao salvar cartão', e)
      setMessage({ type:'error', text: 'Erro ao cadastrar cartão' }) 
    }
    setLoading(false)
  }

  function validate(){
    if(!form.valor || isNaN(parseFloat(form.valor)) || parseFloat(form.valor) <= 0) return 'Valor inválido'
    if(!form.clienteId) return 'Selecione um cliente'
    if(!form.cartaoId) return 'Selecione um cartão'
    return null
  }

  function toISODate(dateStr){
    // dateStr: YYYY-MM-DD -> YYYY-MM-DDT00:00:00
    if(!dateStr) return null
    return `${dateStr}T00:00:00`
  }

  async function save(){
    const v = validate()
    if(v){ setMessage({ type:'error', text: v}); return }
    setLoading(true)
    setMessage(null)
    try{
      const url = editingId ? `${API_BASE}/pagamentos/${editingId}` : `${API_BASE}/pagamentos`
      const method = editingId ? 'PUT' : 'POST'
      const payload = {
        valor: parseFloat(form.valor),
        descricao: form.descricao,
        clienteId: Number(form.clienteId),
        cartaoId: Number(form.cartaoId)
      }
      const iso = toISODate(form.transactionDate)
      if(iso) payload.dataTransacao = iso

      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) })
      if(res.status === 200 || res.status === 201){
        setMessage({ type:'success', text: editingId ? 'Pagamento atualizado' : 'Pagamento criado' })
        await fetchList()
        cancelEdit()
      }else if(res.status === 401){
        setMessage({ type:'error', text: 'Operação não autorizada. Faça login (Admin) para criar/editar/excluir.' })
      }else{
        const t = await res.text()
        setMessage({ type:'error', text: `Erro: ${res.status} ${t}` })
      }
    }catch(e){ console.error('Erro save', e); setMessage({ type:'error', text: 'Erro ao salvar pagamento' }) }
    setLoading(false)
  }

  async function remove(id){
    if(!confirm('Confirmar exclusão?')) return
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/pagamentos/${id}`, { method: 'DELETE', headers: headers() })
      if(res.status === 204){
        setMessage({ type:'success', text: 'Pagamento removido' })
        await fetchList()
      }else if(res.status === 401){
        setMessage({ type:'error', text: 'Não autorizado. Faça login (Admin).' })
      }else{
        const t = await res.text()
        setMessage({ type:'error', text: `Erro ao excluir: ${res.status} ${t}` })
      }
    }catch(e){ console.error('Erro delete', e); setMessage({ type:'error', text: 'Erro ao excluir pagamento' }) }
    setLoading(false)
  }

  // Indicadores handlers - versão simplificada que sempre mostra algo
  async function onGetTicket(){
    const id = indicadores.tmClienteId
    if(!id) return setMessage({ type:'error', text: 'Selecione um cliente' })
    try{
      const res = await fetch(`${API_BASE}/indicadores/ticket-medio/${id}`)
      if(!res.ok){
        return setMessage({ type:'error', text: `Erro ticket médio (${res.status})` })
      }
      const val = await res.json()
      const num = Number(val)
      if(!isNaN(num)){
        setIndicadores({ ...indicadores, tmValor: num })
        setMessage({ type:'success', text: 'Ticket médio calculado!' })
      } else {
        setIndicadores({ ...indicadores, tmValor: null })
        setMessage({ type:'error', text: 'Resposta inválida do servidor' })
      }
    }catch(e){ 
      console.error('Erro ticket', e); 
      setMessage({ type:'error', text: 'Erro ao buscar ticket médio' }) 
    }
  }

  async function onGetDescricao(){
    const id = indicadores.descId
    if(!id) return setMessage({ type:'error', text: 'Selecione um pagamento' })
    try{
      const res = await fetch(`${API_BASE}/indicadores/descricao-pagamento/${id}`)
      if(!res.ok){
        return setMessage({ type:'error', text: `Erro descrição (${res.status})` })
      }
      const txt = await res.text()
      setIndicadores({ ...indicadores, descTexto: txt })
      setMessage({ type:'success', text: 'Descrição gerada!' })
    }catch(e){ 
      console.error('Erro descricao', e); 
      setMessage({ type:'error', text: 'Erro ao buscar descrição' }) 
    }
  }

  async function onRegistrarAlertas(){
    const lim = indicadores.limite
    if(!lim || isNaN(parseFloat(lim))) return setMessage({ type:'error', text: 'Informe um limite válido' })
    try{
      const res = await fetch(`${API_BASE}/indicadores/registrar-alertas?limite=${encodeURIComponent(lim)}`, { method: 'POST' })
      if(!res.ok){
        return setMessage({ type:'error', text: `Erro ao registrar alertas (${res.status})` })
      }
      const qtd = await res.json()
      setMessage({ type:'success', text: `Alertas gerados: ${qtd}` })
      await onListarAlertas()
    }catch(e){ 
      console.error('Erro registrar alertas', e); 
      setMessage({ type:'error', text: 'Erro ao registrar alertas' }) 
    }
  }

  async function onListarAlertas(){
    try{
      const res = await fetch(`${API_BASE}/indicadores/alertas`)
      if(!res.ok){
        return setMessage({ type:'error', text: `Erro ao listar alertas (${res.status})` })
      }
      const arr = await res.json()
      setIndicadores({ ...indicadores, alertas: Array.isArray(arr) ? arr : [] })
      if(Array.isArray(arr) && arr.length > 0){
        setMessage({ type:'success', text: `${arr.length} alertas encontrados` })
      }
    }catch(e){ 
      console.error('Erro listar alertas', e); 
      setMessage({ type:'error', text: 'Erro ao listar alertas' }) 
    }
  }

  async function onGetRelatorio(){
    const id = indicadores.relClienteId
    if(!id) return setMessage({ type:'error', text: 'Selecione um cliente' })
    try{
      const res = await fetch(`${API_BASE}/indicadores/relatorio-consumo/${id}`)
      if(!res.ok){
        return setMessage({ type:'error', text: `Erro relatório (${res.status})` })
      }
      const arr = await res.json()
      setIndicadores({ ...indicadores, relatorio: Array.isArray(arr) ? arr : [] })
      if(Array.isArray(arr) && arr.length > 0){
        setMessage({ type:'success', text: `Relatório gerado com ${arr.length} registros` })
      }
    }catch(e){ 
      console.error('Erro relatorio', e); 
      setMessage({ type:'error', text: 'Erro ao buscar relatório' }) 
    }
  }

  return (
    <div>
      {authToken ? (
        <PaymentsScreen
          pagamentos={pagamentos}
          clientes={clientes}
          cartoes={cartoes}
          message={message}
          onLogout={doLogout}
          onEdit={startEdit}
          onDelete={remove}
          onSave={save}
          onSaveCliente={saveCliente}
          onSaveCartao={saveCartao}
          form={form}
          setForm={setForm}
          loading={loading}
          editingId={editingId}
          onCancelEdit={cancelEdit}
          indicadores={indicadores}
          setIndicadores={setIndicadores}
          onGetTicket={onGetTicket}
          onGetDescricao={onGetDescricao}
          onRegistrarAlertas={onRegistrarAlertas}
          onListarAlertas={onListarAlertas}
          onGetRelatorio={onGetRelatorio}
          apiOffline={apiOffline}
          onRetry={fetchInitial}
        />
      ) : screen === 'register' ? (
        <RegisterScreen 
          onRegister={doRegister} 
          onSwitchToLogin={() => setScreen('login')}
          error={message && message.type === 'error' ? message.text : null} 
        />
      ) : (
        <LoginScreen 
          onLogin={doLogin} 
          onSwitchToRegister={() => setScreen('register')}
          error={message && message.type === 'error' ? message.text : null} 
        />
      )}
    </div>
  )
}
