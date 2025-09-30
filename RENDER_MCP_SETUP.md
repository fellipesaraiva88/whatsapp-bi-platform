# 🔧 Setup do Render MCP - Deploy Automatizado

## Status Atual

❌ **Render MCP não está autenticado/configurado**

O MCP do Render requer autenticação antes de poder criar recursos automaticamente.

## 🚀 Opções de Deploy

### Opção 1: Via Render Dashboard (Mais Rápido) ⭐

1. **Acesse [render.com](https://render.com)** e faça login
2. **New → Blueprint**
3. Conecte o repositório GitHub
4. O `render.yaml` será detectado automaticamente
5. Configure as variáveis de ambiente
6. Deploy! 🎉

**Variáveis necessárias:**
```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=postgresql://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Opção 2: Via Scripts Shell

```bash
# 1. Instalar Render CLI
npm install -g @render-tools/cli

# 2. Autenticar
render login

# 3. Deploy
cd /Users/saraiva/whatsapp-bi-platform
./scripts/deploy-render.sh

# 4. Configurar env vars
./scripts/setup-env.sh

# 5. Inicializar database
./scripts/init-database.sh
```

### Opção 3: Configurar Render MCP (Para automação futura)

**1. Obter API Key do Render:**
- Acesse: https://dashboard.render.com/u/settings#api-keys
- Criar nova API Key
- Copiar o token

**2. Configurar MCP:**

O MCP do Render precisa estar configurado no arquivo de configuração do Claude Code.

**Localização (macOS):**
```bash
~/.config/claude/mcp.json
```

**Adicionar configuração:**
```json
{
  "render": {
    "apiKey": "rnd_SEU_TOKEN_AQUI"
  }
}
```

**3. Reiniciar Claude Code**

**4. Depois você poderá usar comandos como:**
```javascript
// Criar PostgreSQL
await mcp__render__create_postgres({
  name: "whatsapp-bi-db",
  plan: "starter",
  region: "oregon"
});

// Criar Web Service
await mcp__render__create_web_service({
  name: "whatsapp-bi-backend",
  runtime: "node",
  repo: "https://github.com/user/whatsapp-bi-platform",
  buildCommand: "cd backend && npm install",
  startCommand: "cd backend && npm start"
});
```

## 📊 Recursos que serão criados

1. **PostgreSQL Database** (Starter - $7/mês)
   - Storage: 1GB
   - Connections: 97
   
2. **Redis** (Starter - $7/mês)
   - Memory: 256MB
   
3. **Backend Web Service** (Starter - $7/mês)
   - Node.js
   - Express API
   
4. **Frontend Static Site** (Free)
   - React SPA
   - Global CDN

**Total estimado: $21/mês**

## 🎯 Recomendação

Para este primeiro deploy, recomendo a **Opção 1 (Dashboard)** pois é:
- ✅ Mais visual
- ✅ Mais rápido
- ✅ Permite verificar cada passo
- ✅ Fácil troubleshooting

Depois de rodar, você pode configurar o Render MCP para automações futuras.

## ✅ Checklist de Deploy

- [ ] Repositório no GitHub com código commitado
- [ ] Conta no Render.com criada
- [ ] API Key do Anthropic Claude obtida
- [ ] Deploy via Dashboard ou Script executado
- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado no database
- [ ] Testado endpoints da API
- [ ] Frontend acessível e funcionando

## 🆘 Precisa de Ajuda?

Se quiser que eu configure o Render MCP e faça o deploy automaticamente:

1. Obtenha sua Render API Key
2. Me passe o token
3. Eu configuro e executo tudo via MCP

Caso contrário, siga a **Opção 1** que é mais direto!