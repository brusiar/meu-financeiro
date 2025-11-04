# Como Subir para o GitHub

## 1️⃣ Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `meu-financeiro`
3. Descrição: `Sistema de Finanças Pessoais com Spring Boot e React`
4. Escolha: **Private** (recomendado) ou Public
5. **NÃO** marque "Initialize with README"
6. Clique em "Create repository"

## 2️⃣ Comandos para Subir o Código

Execute os comandos abaixo no terminal:

```bash
# Navegar até o diretório do projeto
cd /Users/brunoaraujo/Documents/Projetos/meu-financeiro

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: Sistema de Finanças Pessoais completo"

# Adicionar o repositório remoto (SUBSTITUA SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/meu-financeiro.git

# Renomear branch para main
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

## 3️⃣ Autenticação

Se pedir usuário e senha:
- **Usuário:** seu username do GitHub
- **Senha:** use um **Personal Access Token** (não a senha da conta)

### Como criar Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marque: `repo` (acesso completo)
4. Copie o token gerado (você só verá uma vez!)
5. Use esse token como senha

## 4️⃣ Comandos Úteis

### Ver status
```bash
git status
```

### Adicionar mudanças
```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

### Ver histórico
```bash
git log --oneline
```

### Criar nova branch
```bash
git checkout -b feature/nova-funcionalidade
```

## 5️⃣ Estrutura que será enviada

```
meu-financeiro/
├── backend/              # API Spring Boot
├── frontend/             # Interface React
├── docker-compose.yml    # Orquestração Docker
├── README.md            # Documentação principal
├── DEPLOY.md            # Guia de deploy
├── .gitignore           # Arquivos ignorados
└── GITHUB.md            # Este arquivo
```

## ⚠️ IMPORTANTE

**Arquivos que NÃO serão enviados** (estão no .gitignore):
- `node_modules/` - dependências do Node
- `target/` - build do Java
- `.env` - variáveis de ambiente
- Arquivos de IDE (.idea, .vscode)
- Logs e arquivos temporários

**Isso é bom!** Mantém o repositório limpo e leve.

## 🔒 Segurança

Se o repositório for **público**, certifique-se de:
- ✅ Não há senhas ou tokens no código
- ✅ Credenciais estão em variáveis de ambiente
- ✅ .gitignore está configurado corretamente

## 📝 Próximos Passos

Após subir para o GitHub:

1. **Adicione um README.md** com screenshots
2. **Configure GitHub Actions** para CI/CD (opcional)
3. **Adicione tags** para versões: `git tag v1.0.0`
4. **Crie Issues** para melhorias futuras
5. **Configure branch protection** (Settings → Branches)

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/meu-financeiro.git
```

### Erro: "failed to push"
```bash
git pull origin main --rebase
git push origin main
```

### Arquivos grandes
```bash
# Ver tamanho dos arquivos
du -sh *

# Remover do histórico se necessário
git filter-branch --tree-filter 'rm -f arquivo-grande' HEAD
```
