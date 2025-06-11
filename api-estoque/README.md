# Projeto de Gestão de Produtos com Spring Boot, Docker e PostgreSQL

Este projeto é uma aplicação backend desenvolvida em **Spring Boot**, utilizando **Docker** e **PostgreSQL**. O sistema é uma plataforma para gerenciar produtos, fornecedores, categorias e controle de estoque. Além disso, possui autenticação baseada em **JWT (JSON Web Token)** com **refresh tokens** e controle de acesso baseado em **RBAC (Role-Based Access Control)** e *reconhecimento facial*, implementado com o **Spring Security**. 


## Funcionalidades


### Entidades Principais

- **Usuário**: Representa um usuário do sistema. Existem dois tipos de usuários:
  - **Administrador**: Possui acesso total ao sistema.
  - **Operador**: Possui permissões limitadas de acordo com as funções atribuídas.

- **Categoria**: Representa categorias de produtos.

- **Fornecedor**: Representa os fornecedores de produtos.

- **Produto**: Representa os produtos disponíveis no sistema. Um produto pode ter uma categoria e um fornecedor.

- **Entrada**: Registra as entradas de produtos no estoque, associando um produto e um fornecedor.

- **Saída**: Registra as saídas de produtos do estoque.

- **Inventário**: Acompanha o inventário de produtos, fazendo a relação entre entradas e saídas.

### Controle de Acesso

A autenticação é feita utilizando **JWT (JSON Web Token)** e **refresh tokens**. O sistema utiliza o **Spring Security** para garantir o controle de acesso com **RBAC (Role-Based Access Control)**. O acesso é restrito conforme o tipo de usuário:
- **Administrador**: Acesso total ao sistema, com permissões para criar, editar e deletar entidades.
- **Operador**: Permissões restritas, geralmente para registrar entradas, saídas e visualizar informações.

Durante o reconhecimento facial, a imagem capturada é enviada para o backend, onde um microserviço em Python com DeepFace realiza a comparação facial com as imagens cadastradas (armazenadas como blob no banco de dados PostgreSQL). O Redis entra como cache para otimizar o desempenho, e tudo roda em containers com Docker Compose.

## Tecnologias Utilizadas

- **Spring Boot**: Framework Java para desenvolvimento de aplicações web.
- **Spring Security**: Implementação de segurança, controle de autenticação e autorização.
- **JWT**: JSON Web Token para autenticação baseada em tokens.
- **PostgreSQL**: Banco de dados relacional utilizado para persistência de dados.
- **Docker**: Para criação de contêineres e facilitar a execução e deploy do projeto.
- **Deepface.py**: Modelo de aprendizado de máquina para reconhecimento facial.

## Requisitos

- **JDK 21 ou superior**.
- **Docker**.
- **Docker Compose**.
- **PostgreSQL**.

## Como Rodar o Projeto

### 1. Editar o arquivo .env ### 

Edite o arquivo .env com as credenciais utilizadas no projeto. Exemplo:

```bash
DB_USERNAME=sa
SA_PASSWORD=Admin123
DB_NAME=estoque
DB_DOCKER_PORT=1433
DB_LOCAL_PORT=1433

REDIS_HOST=redis
REDIS_DOCKER_PORT=6379
REDIS_LOCAL_PORT=6379
REDIS_TIMEOUT=5000ms

DEEPFACE_API_DOCKER_PORT=5000
DEEPFACE_API_LOCAL_PORT=5000

SPRING_DOCKER_PORT=8080
SPRING_LOCAL_PORT=8080
JWT_SECRET=supersecret
JWT_EXPIRATION=86400000
```

### 2. Configurar o Banco de Dados

Este projeto utiliza o PostgreSQL para persistência de dados. A configuração do banco de dados está no arquivo application.properties ou application.yml.

Exemplo de configuração do PostgreSQL:

```bash
spring.datasource.url=jdbc:postgresql://localhost:5432/gestao_produtos
spring.datasource.username=usuario
spring.datasource.password=senha
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. Configurar Docker

O projeto possui um arquivo docker-compose.yml para rodar o PostgreSQL e o Spring Boot dentro de contêineres Docker.

```bash
docker-compose up --build
```

### 4. Rodar Aplicação 

Se você preferir rodar o Spring Boot localmente sem o Docker, execute o seguinte comando dentro do diretório do projeto:

```bash
./mvnw spring-boot:run
```

### 5. Endpoints

Os endpoints serão documentados em breve utilizando Swagger Docs

### 6. Testando a Aplicação 

Você pode testar as funcionalidades da API utilizando ferramentas como o Postman ou Insomnia. Não se esqueça de incluir o token JWT no cabeçalho das requisições para endpoints que requerem autenticação.