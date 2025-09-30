# 🚀 Guia de Deploy - WhatsApp BI Platform

## 📋 Checklist Pré-Deploy

- [ ] Criar conta no [Render.com](https://render.com)
- [ ] Obter API Key do Anthropic Claude
- [ ] Criar repositório no GitHub
- [ ] MCP do WhatsApp rodando localmente

## 1️⃣ Setup do Repositório GitHub

```bash
# No diretório do projeto
git remote add origin https://github.com/SEU_USUARIO/whatsapp-bi-platform.git
git push -u origin main
```

## 2️⃣ Deploy no Render

### Opção A: Deploy Automático via Dashboard

1. **Acesse [render.com](https://render.com)** e faça login

2. **New Blueprint** → Conecte seu repositório GitHub

3. **O `render.yaml` será detectado automaticamente!**

4. **Configure as variáveis de ambiente:**

   **Backend Service:**
   - `ANTHROPIC_API_KEY`: Sua chave da Anthropic
   - `SUPABASE_URL`: URL do seu Postgres no Render
   - `SUPABASE_ANON_KEY`: (gerar - veja abaixo)
   - `SUPABASE_SERVICE_ROLE_KEY`: (gerar - veja abaixo)

   **Frontend Service:**
   - `VITE_API_URL`: URL do backend (ex: https://whatsapp-bi-backend.onrender.com)
   - `VITE_SUPABASE_URL`: Mesma URL do Postgres
   - `VITE_SUPABASE_ANON_KEY`: Mesma chave

5. **Deploy!** 🎉

### Opção B: Deploy Manual (Sem Blueprint)

#### Backend
```bash
# 1. Novo Web Service
# 2. Conectar repositório
# 3. Configurar:
Build Command: cd backend && npm install
Start Command: cd backend && npm start
Environment: Node

# 4. Adicionar variáveis de ambiente (lista acima)
```

#### Frontend
```bash
# 1. Novo Static Site
# 2. Conectar repositório
# 3. Configurar:
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist

# 4. Adicionar variáveis de ambiente (lista acima)
```

#### PostgreSQL
```bash
# 1. Novo PostgreSQL Database
# 2. Anotar a connection string
# 3. Executar schema.sql no banco:
#    Render Dashboard → Database → Connect → psql
#    Copiar e colar o conteúdo de backend/src/config/schema.sql
```

#### Redis
```bash
# 1. Novo Redis
# 2. Copiar connection string
# 3. Adicionar ao backend como REDIS_URL
```

## 3️⃣ Gerar Keys do Supabase

Como estamos usando Supabase self-hosted simplificado, você pode usar estas keys de desenvolvimento:

```bash
# ANON KEY (frontend - permissões limitadas)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# SERVICE ROLE KEY (backend - permissões completas)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**⚠️ Para produção:** Gere keys próprias usando:
```bash
# Instalar supabase CLI
npm install -g supabase

# Gerar JWT secret
openssl rand -base64 32

# Gerar keys com seu JWT secret
# Use https://supabase.com/docs/guides/auth/jwts
```

## 4️⃣ Configurar Database Schema

Após criar o PostgreSQL no Render:

```bash
# 1. Conectar via psql
#    Render Dashboard → PostgreSQL → Connect → External Connection

# 2. Copiar comando de conexão, exemplo:
psql postgres://user:pass@host/database

# 3. Executar schema:
\i backend/src/config/schema.sql

# Ou copiar e colar o conteúdo do arquivo diretamente
```

## 5️⃣ Testar o Deploy

1. **Backend Health Check:**
```bash
curl https://seu-backend.onrender.com/health
```

2. **Frontend:** Abra a URL no navegador

3. **Testar API:**
```bash
# Listar contatos
curl https://seu-backend.onrender.com/api/contacts

# Sincronizar (requer MCP rodando localmente e ngrok)
curl -X POST https://seu-backend.onrender.com/api/sync/contacts
```

## 6️⃣ Conectar MCP WhatsApp ao Backend em Produção

Como o MCP roda localmente, você precisa expor via ngrok ou similar:

```bash
# Terminal 1: MCP WhatsApp rodando
# Terminal 2: ngrok
ngrok http 3000

# Pegar URL pública (ex: https://abc123.ngrok.io)
# Atualizar no código do backend:
# whatsapp.service.js → trocar localhost:3000 por URL ngrok
```

**Alternativa:** Deploy do MCP em servidor próprio (VPS, Docker)

## 7️⃣ Variáveis de Ambiente Completas

### Backend (`whatsapp-bi-backend`)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://...
```

### Frontend (`whatsapp-bi-frontend`)
```env
VITE_API_URL=https://whatsapp-bi-backend.onrender.com
VITE_SUPABASE_URL=postgresql://user:pass@host:port/db
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🐛 Troubleshooting

### Backend não inicia
- Verificar logs no Render Dashboard
- Confirmar todas env vars configuradas
- Testar conexão com Postgres

### Frontend não carrega dados
- Verificar VITE_API_URL correto
- Abrir DevTools → Network para ver erros
- Confirmar CORS habilitado no backend

### Database connection failed
- Verificar se PostgreSQL está rodando
- Confirmar connection string
- Verificar se schema foi executado

### IA não funciona
- Verificar ANTHROPIC_API_KEY válida
- Confirmar créditos na conta Anthropic
- Verificar logs de erro no backend

## 📊 Monitoramento

No Render Dashboard você pode:
- Ver logs em tempo real
- Configurar alertas
- Ver métricas de CPU/RAM
- Escalar serviços

## 🔄 Continuous Deployment

Com blueprint configurado:
```bash
git add .
git commit -m "feat: nova feature"
git push

# Render detecta push e faz deploy automático! 🎉
```

## 💰 Custos Estimados no Render

**Free Tier:**
- Backend: $0 (750h/mês)
- Frontend: $0 (ilimitado)
- PostgreSQL: $0 (1GB)
- Redis: $0 (25MB)

**Starter (recomendado):**
- Backend: $7/mês
- PostgreSQL: $7/mês
- Redis: $7/mês
- Frontend: $0
**Total: ~$21/mês**

## 🎉 Pronto!

Seu WhatsApp BI Platform está no ar!

**Próximos Passos:**
1. Sincronizar contatos do WhatsApp
2. Executar análise com IA
3. Testar envio de mensagens humanizadas
4. Explorar dashboard e métricas

**Need Help?** Abra uma issue no GitHub!