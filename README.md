# WhatsApp BI Platform 🚀

Plataforma de Business Intelligence para WhatsApp com IA que aprende seu estilo de conversa e envia mensagens humanizadas.

## 🎯 Features

### MVP
- ✅ Dashboard com métricas em tempo real
- ✅ Sincronização automática de mensagens do WhatsApp
- ✅ CRM completo com perfis enriquecidos
- ✅ Pipeline de vendas visual

### IA Humanizada
- ✅ Análise de conversas (sentimento, tom, intenção)
- ✅ Aprende seu estilo de escrita
- ✅ Gera mensagens que parecem escritas por você
- ✅ Envia em etapas com pausas naturais (simula digitação)
- ✅ Sugestões inteligentes de próxima ação

### CRM
- ✅ Categorização automática de contatos
- ✅ Tags automáticas baseadas em comportamento
- ✅ Histórico completo de interações
- ✅ Pipeline de vendas
- ✅ Métricas de performance

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Supabase (self-hosted PostgreSQL)
- Claude AI (Anthropic)
- Redis (filas)
- MCP WhatsApp

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Recharts
- React Router

**Infraestrutura:**
- Docker Compose
- Render (deploy)
- Supabase Realtime

## 🚀 Quick Start

### Local Development

1. **Clone e instale:**
```bash
git clone <repo>
cd whatsapp-bi-platform
cp .env.example .env
# Edite .env com suas credenciais
```

2. **Inicie com Docker:**
```bash
docker-compose up -d
```

3. **Acesse:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- Supabase Studio: http://localhost:3010
- Supabase API: http://localhost:8000

### Sem Docker (manual)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Configure .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📊 Como Usar

### 1. Sincronizar Contatos do WhatsApp
```bash
# Via API
POST /api/sync/contacts

# Ou no dashboard, clique em "Sincronizar"
```

### 2. Analisar Contato com IA
```bash
POST /api/ai/analyze/:contactJid
```

### 3. Enviar Mensagem Humanizada
```bash
POST /api/ai/send-message
{
  "recipient_jid": "5511999999999@s.whatsapp.net",
  "intent": "follow_up",
  "specific_points": [
    "Proposta enviada ontem",
    "Desconto de 15% válido até sexta"
  ]
}
```

## 🔑 Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development
```

## 📡 API Endpoints

### Sync
- `POST /api/sync/contacts` - Sincronizar contatos
- `POST /api/sync/messages/:chatJid` - Sincronizar mensagens
- `POST /api/sync/auto-pipeline` - Pipeline automático

### Contacts
- `GET /api/contacts` - Listar contatos
- `GET /api/contacts/:jid` - Obter contato
- `PUT /api/contacts/:jid` - Atualizar contato

### AI
- `POST /api/ai/analyze/:contactJid` - Analisar conversa
- `POST /api/ai/suggest/:contactJid` - Sugerir interação
- `POST /api/ai/send-message` - Enviar mensagem humanizada

### Dashboard
- `GET /api/dashboard/metrics` - Métricas
- `GET /api/dashboard/pipeline` - Pipeline

### Realtime
- `POST /api/realtime/start` - Iniciar sync realtime
- `POST /api/realtime/stop` - Parar sync realtime

## 🎨 Screenshots

[Adicionar screenshots depois]

## 🧠 Como Funciona a IA Humanizada

1. **Análise**: IA analisa seu histórico de mensagens com o contato
2. **Aprendizado**: Aprende seu estilo (tom, expressões, emojis, tamanho de mensagem)
3. **Geração**: Gera mensagem que parece ter sido escrita por você
4. **Envio**: Envia em etapas com pausas naturais (simula digitação humana)
5. **Registro**: Salva interação no CRM automaticamente

## 🚢 Deploy no Render

1. **Conecte o repositório no Render**

2. **Configure as variáveis de ambiente:**
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy automático via `render.yaml`**

Ou manual:
```bash
# Backend
render deploy --service whatsapp-bi-backend

# Frontend
render deploy --service whatsapp-bi-frontend
```

## 📝 Database Schema

Ver `backend/src/config/schema.sql` para schema completo.

Tabelas principais:
- `contacts` - CRM de contatos
- `messages` - Todas as mensagens
- `ai_analysis` - Análises de IA
- `interactions` - Log de interações
- `conversation_style` - Estilo aprendido
- `pipeline` - Pipeline de vendas
- `ai_suggestions` - Sugestões da IA

## 🤝 Contribuindo

PRs são bem-vindos! Para grandes mudanças, abra uma issue primeiro.

## 📄 Licença

MIT

## 🆘 Suporte

Abra uma issue no GitHub.

---

**Feito com ❤️ usando Claude Code CLI**