#!/bin/bash

# Deploy automatizado no Render usando CLI
# Requer: render CLI instalada e autenticada

set -e

echo "🚀 Deploy WhatsApp BI Platform no Render"
echo "========================================"

# Verificar se render CLI está instalada
if ! command -v render &> /dev/null; then
    echo "⚠️  Render CLI não encontrada. Instalando..."
    npm install -g @render-tools/cli
fi

# Verificar autenticação
echo "🔐 Verificando autenticação..."
if ! render whoami &> /dev/null; then
    echo "⚠️  Não autenticado. Por favor, execute:"
    echo "render login"
    exit 1
fi

echo "✅ Autenticado!"

# Criar services via blueprint
echo "📦 Criando services via blueprint..."

if [ -f "render.yaml" ]; then
    echo "📄 Blueprint encontrado, fazendo deploy..."
    render blueprint deploy
else
    echo "⚠️  render.yaml não encontrado"
    exit 1
fi

echo ""
echo "✅ Deploy iniciado com sucesso!"
echo ""
echo "📊 Próximos passos:"
echo "1. Acesse https://dashboard.render.com"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute ./scripts/setup-env.sh"
echo "4. Execute ./scripts/init-database.sh"
echo ""
echo "🎉 Deploy em andamento!"