# 🎉 Deploy Completo - WhatsApp BI Platform

## ✅ Recursos Criados no Render

### 1. PostgreSQL Database ✅
- **Nome:** whatsapp-bi-postgres
- **ID:** dpg-d3doj78dl3ps73c2i4ug-a
- **Plan:** Free
- **Status:** Available
- **Dashboard:** https://dashboard.render.com/d/dpg-d3doj78dl3ps73c2i4ug-a
- **Connection String:** 
```
postgresql://whatsapp_bi_user:0hWh03weWtE2OApD77yxNsgMF7W3gnVo@dpg-d3doj78dl3ps73c2i4ug-a.oregon-postgres.render.com:5432/whatsapp_bi
```

### 2. Backend Web Service ✅
- **Nome:** whatsapp-bi-backend
- **ID:** srv-d3dojn6r433s73efu4l0
- **Plan:** Starter ($7/mês)
- **URL:** https://whatsapp-bi-backend.onrender.com
- **Dashboard:** https://dashboard.render.com/web/srv-d3dojn6r433s73efu4l0
- **Env Vars Configuradas:**
  - NODE_ENV=production
  - PORT=3001
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - REDIS_URL

### 3. Frontend Static Site ✅
- **Nome:** whatsapp-bi-frontend
- **ID:** srv-d3dojgr7mgec73d24i30
- **Plan:** Free
- **URL:** https://whatsapp-bi-frontend.onrender.com
- **Dashboard:** https://dashboard.render.com/static/srv-d3dojgr7mgec73d24i30
- **Env Vars:**
  - VITE_API_URL=https://whatsapp-bi-backend.onrender.com

### 4. GitHub Repository ✅
- **URL:** https://github.com/fellipesaraiva88/whatsapp-bi-platform
- **Branch:** main
- **Commits:** 5 commits totais
- **Auto-deploy:** Habilitado (push → deploy automático)

## 🔧 Próximo Passo Importante

### Executar Schema SQL

O database foi criado mas precisa aguardar alguns minutos para aceitar conexões externas (limitação free tier).

**Em 5-10 minutos, execute:**

```bash
cd /Users/saraiva/whatsapp-bi-platform

# Executar schema
PGPASSWORD=0hWh03weWtE2OApD77yxNsgMF7W3gnVo psql \
  "postgresql://whatsapp_bi_user@dpg-d3doj78dl3ps73c2i4ug-a.oregon-postgres.render.com:5432/whatsapp_bi?sslmode=require" \
  -f backend/src/config/schema.sql
```

**Ou use o script:**
```bash
./scripts/init-database.sh
```

## 📊 Status dos Deployments

Acompanhe em tempo real:
- Backend: https://dashboard.render.com/web/srv-d3dojn6r433s73efu4l0
- Frontend: https://dashboard.render.com/static/srv-d3dojgr7mgec73d24i30

**Tempo estimado de build:**
- Backend: ~3-5 minutos
- Frontend: ~2-3 minutos

## 🎯 Testar Quando Pronto

### 1. Backend Health Check
```bash
curl https://whatsapp-bi-backend.onrender.com/health
```

**Resposta esperada:**
```json
{"status":"ok","timestamp":"2025-09-30T..."}
```

### 2. Frontend
Abra no navegador:
```
https://whatsapp-bi-frontend.onrender.com
```

### 3. API Endpoints
```bash
# Listar contatos (após sync)
curl https://whatsapp-bi-backend.onrender.com/api/contacts

# Métricas dashboard
curl https://whatsapp-bi-backend.onrender.com/api/dashboard/metrics
```

## ⚙️ Configurações Faltantes

### ANTHROPIC_API_KEY (IMPORTANTE!)

O backend precisa da API key do Claude para funcionar:

```bash
# Via dashboard: 
# https://dashboard.render.com/web/srv-d3dojn6r433s73efu4l0/env-vars
# Adicionar: ANTHROPIC_API_KEY = sk-ant-...

# Ou via CLI:
curl -X PUT https://api.render.com/v1/services/srv-d3dojn6r433s73efu4l0/env-vars \
  -H "Authorization: Bearer rnd_9t05sbRIabPAFJ4RlHvyTFXgk6lg" \
  -H "Content-Type: application/json" \
  -d '[{"key": "ANTHROPIC_API_KEY", "value": "sk-ant-SEU_TOKEN"}]'
```

## 🔄 Como Atualizar

Qualquer push no GitHub dispara deploy automático:

```bash
cd /Users/saraiva/whatsapp-bi-platform

# Fazer mudanças...
git add .
git commit -m "feat: nova feature"
git push

# Render detecta e faz deploy automático! 🚀
```

## 💰 Custos Mensais

- **PostgreSQL Free:** $0 (expira em 30 dias - migrar para paid)
- **Backend Starter:** $7/mês
- **Frontend Static:** $0
- **Total:** $7/mês (ou $14/mês com Postgres paid)

## 📝 Logs e Troubleshooting

### Ver Logs em Tempo Real

**Backend:**
```bash
# Via dashboard ou:
curl -X GET https://api.render.com/v1/services/srv-d3dojn6r433s73efu4l0/logs \
  -H "Authorization: Bearer rnd_9t05sbRIabPAFJ4RlHvyTFXgk6lg"
```

**Frontend:**
```bash
curl -X GET https://api.render.com/v1/services/srv-d3dojgr7mgec73d24i30/logs \
  -H "Authorization: Bearer rnd_9t05sbRIabPAFJ4RlHvyTFXgk6lg"
```

### Problemas Comuns

**Backend não inicia:**
- Verificar ANTHROPIC_API_KEY configurada
- Verificar logs no dashboard
- Testar conexão com database

**Frontend 404:**
- Aguardar build completar
- Verificar se build foi bem-sucedido
- Checar se publishPath está correto (dist)

**Database connection error:**
- Aguardar 5-10 minutos após criação
- Verificar se schema foi executado
- Testar conexão manual com psql

## 🎉 Pronto!

Seu WhatsApp BI Platform está deployado!

**URLs Principais:**
- 🎨 Frontend: https://whatsapp-bi-frontend.onrender.com
- 🔧 Backend API: https://whatsapp-bi-backend.onrender.com
- 🗄️ Database: dpg-d3doj78dl3ps73c2i4ug-a.oregon-postgres.render.com

**Próximos Passos:**
1. ⏰ Aguardar 5-10 minutos
2. 🗄️ Executar schema SQL
3. 🔑 Adicionar ANTHROPIC_API_KEY
4. ✅ Testar endpoints
5. 📱 Sincronizar contatos do WhatsApp
6. 🤖 Testar IA humanizada

**Need Help?** 
- Render Dashboard: https://dashboard.render.com
- Logs e monitoring disponíveis em cada service
- GitHub: https://github.com/fellipesaraiva88/whatsapp-bi-platform