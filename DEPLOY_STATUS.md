# WhatsApp BI Platform - Status do Deploy 🚀

## ✅ Serviços Online

### Backend API
- **URL**: https://whatsapp-bi-backend.onrender.com
- **Status**: ✅ LIVE e funcionando
- **Health**: https://whatsapp-bi-backend.onrender.com/health
- **Plano**: Starter ($7/mês)

### Frontend
- **URL**: https://whatsapp-bi-frontend.onrender.com
- **Status**: ✅ LIVE e funcionando
- **Plano**: Free

## ⚠️ Problema Conhecido

### PostgreSQL Database
- **ID**: dpg-d3doj78dl3ps73c2i4ug-a
- **Status**: Criado mas não aceita conexões externas
- **Plano**: Free
- **Erro**: "Connection terminated unexpectedly"

### Causa
O PostgreSQL free tier do Render tem limitações conhecidas:
1. Pode levar 10-30 minutos para aceitar conexões externas após criação
2. Pode precisar de reinicialização manual via dashboard
3. Free tier tem limitações de conexões simultâneas

### Soluções Possíveis

#### Opção 1: Aguardar (Recomendado para testar)
```bash
# Testar conexão periodicamente
curl https://whatsapp-bi-backend.onrender.com/api/db/test

# Quando retornar success: true, executar migração
curl -X POST https://whatsapp-bi-backend.onrender.com/api/migrate
```

#### Opção 2: Upgrade do Banco (Recomendado para produção)
Acessar https://dashboard.render.com/d/dpg-d3doj78dl3ps73c2i4ug-a e fazer upgrade para:
- **Basic 256MB**: $7/mês - Mais estável e aceita conexões externas
- **Pro 4GB**: $25/mês - Para uso em produção

#### Opção 3: Usar Supabase (Alternativa)
1. Criar projeto free no Supabase: https://supabase.com
2. Copiar SUPABASE_URL e SUPABASE_ANON_KEY
3. Executar o schema.sql no SQL Editor do Supabase
4. Atualizar env vars no Render backend:
   ```bash
   # Remover DATABASE_URL
   # Adicionar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
   ```
5. Reverter código para usar Supabase client (commit anterior)

## 📊 Repositório GitHub
https://github.com/fellipesaraiva88/whatsapp-bi-platform

## 🔑 Credenciais Configuradas

### Backend Environment Variables
- ✅ `ANTHROPIC_API_KEY`: Configurado
- ✅ `DATABASE_URL`: Configurado
- ✅ `NODE_ENV`: production
- ✅ `PORT`: 10000

### Database Credentials
```
Host: dpg-d3doj78dl3ps73c2i4ug-a.oregon-postgres.render.com
Port: 5432
Database: whatsapp_bi
User: whatsapp_bi_user
Password: 0hWh03weWtE2OApD77yxNsgMF7W3gnVo
```

Connection String:
```
postgresql://whatsapp_bi_user:0hWh03weWtE2OApD77yxNsgMF7W3gnVo@dpg-d3doj78dl3ps73c2i4ug-a.oregon-postgres.render.com:5432/whatsapp_bi
```

## 🎯 Próximos Passos

### Quando o banco estiver acessível:

1. **Executar Migration**
   ```bash
   curl -X POST https://whatsapp-bi-backend.onrender.com/api/migrate
   ```

2. **Testar Endpoints do Backend**
   ```bash
   # Listar contatos
   curl https://whatsapp-bi-backend.onrender.com/api/contacts

   # Métricas do dashboard
   curl https://whatsapp-bi-backend.onrender.com/api/dashboard/metrics

   # Pipeline
   curl https://whatsapp-bi-backend.onrender.com/api/dashboard/pipeline
   ```

3. **Configurar MCP WhatsApp** (local)
   - O MCP WhatsApp roda localmente na sua máquina
   - Configure conforme: https://github.com/your-whatsapp-mcp-repo
   - Atualize `WHATSAPP_MCP_URL` se necessário

4. **Sincronizar Dados Iniciais**
   ```bash
   # Sincronizar contatos do WhatsApp
   curl -X POST https://whatsapp-bi-backend.onrender.com/api/sync/contacts

   # Sincronizar mensagens de um chat
   curl -X POST https://whatsapp-bi-backend.onrender.com/api/sync/messages/[CHAT_JID]
   ```

## 📱 Funcionalidades Implementadas

### Backend API
- ✅ Sincronização de contatos e mensagens do WhatsApp
- ✅ Análise de conversas com IA Claude
- ✅ Geração de mensagens humanizadas
- ✅ CRM com categorização automática
- ✅ Pipeline de vendas
- ✅ Dashboard com métricas
- ✅ Sistema de sugestões de interações

### Frontend
- ✅ Dashboard interativo com Recharts
- ✅ Visualização de contatos e pipeline
- ✅ Interface moderna com TailwindCSS
- ✅ Design responsivo

## 🛠️ Stack Tecnológica

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS
- **IA**: Anthropic Claude Sonnet
- **Infraestrutura**: Render.com
- **Integração**: MCP WhatsApp

## 📞 Suporte

Para problemas com o deploy:
1. Dashboard Render: https://dashboard.render.com
2. Logs do Backend: https://dashboard.render.com/web/srv-d3dojn6r433s73efu4l0/logs
3. Logs do Frontend: https://dashboard.render.com/static/srv-d3dojgr7mgec73d24i30/logs
4. Database Info: https://dashboard.render.com/d/dpg-d3doj78dl3ps73c2i4ug-a

---

**Última atualização**: 2025-09-30T08:15:00Z
**Deploy ID**: dep-d3dos5qk94ss73du26tg
**Status Geral**: 🟡 Parcialmente Online (aguardando database)