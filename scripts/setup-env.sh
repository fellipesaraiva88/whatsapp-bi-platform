#!/bin/bash
set -e
echo "⚙️  Configuração de Variáveis - Render"
read -p "ANTHROPIC_API_KEY: " ANTHROPIC_KEY
read -p "Backend Service ID: " BACKEND_ID
render env set ANTHROPIC_API_KEY="$ANTHROPIC_KEY" --service-id="$BACKEND_ID"
echo "✅ Configurado!"