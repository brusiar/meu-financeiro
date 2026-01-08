#!/bin/bash

echo "🚀 Iniciando deploy em produção..."

# Para os containers existentes
echo "⏹️  Parando containers..."
docker-compose -f docker-compose.prod.yml down

# Remove imagens antigas
echo "🗑️  Removendo imagens antigas..."
docker rmi $(docker images -q financeiro-*) 2>/dev/null || true

# Rebuild e start
echo "🔨 Construindo e iniciando containers..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://carimbo:3000"
echo "🔧 Backend: http://carimbo:8080"

# Mostra logs
echo "📋 Logs dos containers:"
docker-compose -f docker-compose.prod.yml logs -f