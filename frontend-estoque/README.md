# Frontend para Gestão de Produtos

Este projeto é a interface web do sistema de Gestão de Produtos. Foi desenvolvido em **React.js**, oferecendo uma interface moderna e responsiva para gerenciar usuários, produtos, fornecedores, categorias e controle de inventário.

## Funcionalidades

- **Autenticação**:
  - Login com **JWT** e gerenciamento de **refresh tokens**.
  - Logout e renovação automática do token quando necessário.

- **Controle de Acesso**:
  - Usuários Administradores têm acesso a todas as telas e funcionalidades.
  - Usuários Operadores possuem acesso restrito baseado em suas permissões.

- **Gestão de Entidades**:
  - **Usuários**: Gerenciamento de usuários (criação, edição e listagem).
  - **Produtos**: Registro e listagem de produtos.
  - **Categorias**: Gerenciamento de categorias de produtos.
  - **Fornecedores**: Cadastro e listagem de fornecedores.
  - **Inventário**: Controle de entradas e saídas de produtos.

- **Responsividade**:
  - Interface otimizada para uso em dispositivos móveis, tablets e desktops.

## Tecnologias Utilizadas

- **React.js**: Framework para desenvolvimento de interfaces de usuário.
- **React Router**: Gerenciamento de rotas.
- **Axios**: Para chamadas HTTP e integração com o backend.
- **Context API**: Gerenciamento global de estado (autenticação, temas, etc.).
- **Material-UI**: Biblioteca de componentes para design moderno.
- **Formik + Yup**: Gerenciamento e validação de formulários.

## Requisitos

- **Node.js** (v16 ou superior).
- **npm** ou **yarn** para gerenciamento de pacotes.
- **Docker** (opcional, para rodar o ambiente em contêiner).

## Como Rodar o Projeto

### 1. Clonar o Repositório

Clone o repositório para sua máquina local:

```bash
git clone https://github.com/seu-usuario/gestao-produtos-frontend.git
cd gestao-produtos-frontend
```

### 2. Instalar Dependências 

```bash
npm install
```

### 3. Rodar o Projeto localmente 

```bash
npm run dev
```