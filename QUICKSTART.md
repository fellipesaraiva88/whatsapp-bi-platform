# ⚡ Quick Start - Deploy em 5 Minutos

## 🎯 Pré-requisitos

- Conta GitHub
- Conta Render.com (free tier OK)
- API Key do Anthropic Claude

## 🚀 Deploy Rápido

### 1️⃣ Push para GitHub (30 segundos)

```bash
cd /Users/saraiva/whatsapp-bi-platform

# Criar repo no GitHub primeiro em: https://github.com/new
# Depois:

git remote add origin https://github.com/SEU_USUARIO/whatsapp-bi-platform.git
git push -u origin main
```

### 2️⃣ Deploy no Render (2 minutos)

1. Acesse: https://dashboard.render.com
2. Click: **New → Blueprint**
3. Conecte seu repositório GitHub
4. O `render.yaml` é detectado automaticamente
5. Click: **Apply**

### 3️⃣ Configurar Env Vars (1 minuto)

No Render Dashboard, adicione para cada serviço:

**Backend (`whatsapp-bi-backend`):**
```
ANTHROPIC_API_KEY=sk-ant-api-...
```

**Database será criado automaticamente!** ✨

### 4️⃣ Executar Schema SQL (1 minuto)

```bash
# Pegar connection string do Render Dashboard → PostgreSQL → Info
./scripts/init-database.sh
```

### 5️⃣ Testar (30 segundos)

```bash
# Health check
curl https://whatsapp-bi-backend.onrender.com/health

# Abrir frontend
open https://whatsapp-bi-frontend.onrender.com
```

## ✅ Pronto!

🎉 Seu WhatsApp BI Platform está no ar!

## 📱 Próximos Passos

1. **Sincronizar contatos:**
   - Abra o dashboard
   - Click "Sincronizar WhatsApp"

2. **Testar IA:**
   - Vá em "Contatos"
   - Selecione um contato
   - Click "Analisar com IA"

3. **Enviar mensagem humanizada:**
   - Vá em "Assistente IA"
   - Selecione contato
   - Define intenção
   - Click "Enviar"

## 🔧 Troubleshooting

**Backend não inicia?**
- Verificar ANTHROPIC_API_KEY configurada
- Ver logs no Render Dashboard

**Database error?**
- Executar schema.sql: `./scripts/init-database.sh`

**Frontend branco?**
- Verificar se backend está rodando
- Abrir DevTools → Console

## 💰 Custos

- **Free Tier:** Backend + Frontend + DB = $0/mês (com limitações)
- **Starter (recomendado):** $21/mês (tudo ilimitado)

## 📚 Docs Completos

- `README.md` - Documentação técnica
- `DEPLOY.md` - Guia detalhado de deploy
- `RENDER_MCP_SETUP.md` - Configuração do MCP

---

**Precisa de ajuda?** Abra uma issue no GitHub!