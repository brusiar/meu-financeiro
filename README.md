# Meu Financeiro - Sistema de Finanças Pessoais

Sistema completo para gerenciamento de finanças pessoais desenvolvido com Spring Boot e React.

## 🚀 Tecnologias

### Backend
- **Spring Boot 3.x** - Framework Java
- **Spring Data JPA** - Persistência de dados
- **Spring Security** - Autenticação e autorização
- **PostgreSQL** - Banco de dados
- **Maven** - Gerenciamento de dependências

### Frontend
- **React 18** - Interface do usuário
- **React Router** - Navegação
- **Axios** - Requisições HTTP

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **PostgreSQL** - Banco de dados

## 📋 Funcionalidades

- ✅ Dashboard com resumo financeiro
- ✅ Cadastro de contas a pagar (fixas e variáveis)
- ✅ Gerenciamento de cartões de crédito
- 🔄 Controle de gastos com parcelamentos
- 🔄 Registro de fontes de renda
- 🔄 Categorização de gastos
- 🔄 Relatórios financeiros

## 🛠️ Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 8080 e 5432 disponíveis

### Executando o projeto

1. **Clone e acesse o diretório:**
   ```bash
   cd /Users/brunoaraujo/Documents/Projetos/meu-financeiro
   ```

2. **Execute com Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Banco PostgreSQL: localhost:5432

### Credenciais padrão
- **Usuário:** admin
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
meu-financeiro/
├── backend/                 # API Spring Boot
│   ├── src/main/java/
│   │   └── com/financeiro/
│   │       ├── model/       # Entidades JPA
│   │       ├── repository/  # Repositórios
│   │       ├── service/     # Lógica de negócio
│   │       └── controller/  # Controllers REST
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   └── services/       # Serviços de API
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml       # Orquestração dos serviços
```

## 🗄️ Modelo de Dados

### Entidades Principais
- **Usuario** - Dados do usuário
- **Categoria** - Categorias de receitas/despesas
- **ContaPagar** - Contas fixas e variáveis
- **CartaoCredito** - Dados dos cartões
- **FonteRenda** - Fontes de receita
- **GastoCartao** - Gastos no cartão (com parcelamento)
- **GastoDiario** - Gastos avulsos

## 🔧 Desenvolvimento

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

### Banco de Dados
O PostgreSQL será criado automaticamente via Docker com as configurações:
- **Database:** financeiro_db
- **User:** financeiro_user
- **Password:** financeiro_pass

## 📝 Próximos Passos

1. Implementar controllers REST no backend
2. Conectar frontend com a API
3. Adicionar autenticação JWT
4. Implementar funcionalidades de parcelamento
5. Criar relatórios e gráficos
6. Adicionar testes unitários
7. Implementar backup automático

## 🤝 Contribuição

Este é um projeto pessoal, mas sugestões são bem-vindas!

## 📄 Licença

Projeto de uso pessoal.