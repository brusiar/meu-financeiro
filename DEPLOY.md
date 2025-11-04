# Guia de Deploy - Meu Financeiro

## 📦 Persistência de Dados

Os dados estão configurados para **NUNCA se perderem**! 

### Como funciona:
- O PostgreSQL usa um **volume Docker persistente** (`postgres_data`)
- Os dados ficam salvos no servidor mesmo após derrubar a aplicação
- Ao subir novamente, todos os dados retornam automaticamente

## 🚀 Deploy no Servidor Local

### 1. Pré-requisitos no Servidor
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. Transferir o Projeto
```bash
# No seu computador, compactar o projeto
cd /Users/brunoaraujo/Documents/Projetos
tar -czf meu-financeiro.tar.gz meu-financeiro/

# Transferir para o servidor (substitua IP_DO_SERVIDOR)
scp meu-financeiro.tar.gz usuario@IP_DO_SERVIDOR:/home/usuario/

# No servidor, descompactar
ssh usuario@IP_DO_SERVIDOR
cd /home/usuario
tar -xzf meu-financeiro.tar.gz
cd meu-financeiro
```

### 3. Subir a Aplicação
```bash
# Primeira vez ou após mudanças no código
docker-compose up -d --build

# Apenas subir (sem rebuild)
docker-compose up -d
```

### 4. Acessar a Aplicação
- Frontend: `http://IP_DO_SERVIDOR:3000`
- Backend API: `http://IP_DO_SERVIDOR:8080`

## 🔧 Comandos Úteis

### Ver logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### Parar a aplicação
```bash
docker-compose down
```

### Reiniciar a aplicação
```bash
docker-compose restart
```

### Ver status dos containers
```bash
docker-compose ps
```

## 💾 Backup dos Dados

### Fazer backup do banco
```bash
# Criar backup
docker exec financeiro-postgres pg_dump -U financeiro_user financeiro_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20231023.sql | docker exec -i financeiro-postgres psql -U financeiro_user -d financeiro_db
```

### Backup do volume Docker
```bash
# Criar backup do volume
docker run --rm -v meu-financeiro_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data

# Restaurar backup do volume
docker run --rm -v meu-financeiro_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres_backup_20231023.tar.gz -C /
```

## 🔒 Segurança na Rede Local

### Configurar IP fixo no servidor
Edite o `docker-compose.yml` para expor apenas na rede local:

```yaml
services:
  frontend:
    ports:
      - "192.168.1.100:3000:3000"  # Substitua pelo IP do servidor
  
  backend:
    ports:
      - "192.168.1.100:8080:8080"
```

### Firewall (opcional)
```bash
# Permitir apenas rede local
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

## 🔄 Atualizar a Aplicação

```bash
# 1. Parar a aplicação
docker-compose down

# 2. Atualizar o código (git pull ou transferir novos arquivos)

# 3. Rebuild e subir
docker-compose up -d --build

# Os dados do banco permanecem intactos!
```

## ⚠️ IMPORTANTE

- **NUNCA execute** `docker-compose down -v` - isso apaga os volumes e você perde os dados!
- Use apenas `docker-compose down` (sem o `-v`)
- Faça backups regulares do banco de dados
- O volume `postgres_data` fica em `/var/lib/docker/volumes/meu-financeiro_postgres_data`

## 📊 Monitoramento

### Ver uso de espaço dos volumes
```bash
docker system df -v
```

### Ver tamanho do banco de dados
```bash
docker exec financeiro-postgres psql -U financeiro_user -d financeiro_db -c "SELECT pg_size_pretty(pg_database_size('financeiro_db'));"
```

## 🆘 Troubleshooting

### Aplicação não sobe
```bash
# Ver logs de erro
docker-compose logs

# Verificar se as portas estão livres
sudo netstat -tulpn | grep -E '3000|8080|5432'
```

### Banco de dados corrompido
```bash
# Restaurar do backup mais recente
docker-compose down
docker volume rm meu-financeiro_postgres_data
docker-compose up -d postgres
# Aguardar o postgres inicializar
sleep 10
cat backup_mais_recente.sql | docker exec -i financeiro-postgres psql -U financeiro_user -d financeiro_db
docker-compose up -d
```

## 📝 Credenciais Padrão

- **Usuário:** admin
- **Senha:** admin123

**Recomendação:** Altere a senha após o primeiro login!
