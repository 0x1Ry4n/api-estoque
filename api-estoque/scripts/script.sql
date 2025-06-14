-- =============================================
-- CRIAÇÃO DO BANCO DE DADOS ESTOQUE
-- =============================================

-- Cria o banco de dados estoque com configurações básicas
USE [master]
GO

CREATE DATABASE [estoque]
CONTAINMENT = NONE
ON PRIMARY 
(
    NAME = N'estoque', 
    FILENAME = N'/var/opt/mssql/data/estoque.mdf',
    SIZE = 8MB,                 -- Tamanho inicial de 8MB
    MAXSIZE = UNLIMITED,        -- Crescimento ilimitado
    FILEGROWTH = 64MB           -- Cresce em incrementos de 64MB
)
LOG ON 
(
    NAME = N'estoque_log',
    FILENAME = N'/var/opt/mssql/data/estoque_log.ldf',
    SIZE = 8MB,                 -- Tamanho inicial de 8MB
    MAXSIZE = 2TB,              -- Tamanho máximo de 2TB para o log
    FILEGROWTH = 64MB           -- Cresce em incrementos de 64MB
)
WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO

-- Configura o nível de compatibilidade para SQL Server 2019 (versão 15.0)
ALTER DATABASE [estoque] SET COMPATIBILITY_LEVEL = 150
GO

-- Habilita full-text search se estiver instalado
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
BEGIN
    EXEC [estoque].[dbo].[sp_fulltext_database] @action = 'enable'
END
GO

-- =============================================
-- CONFIGURAÇÕES DO BANCO DE DADOS
-- =============================================

-- Configurações de compatibilidade ANSI
ALTER DATABASE [estoque] SET ANSI_NULL_DEFAULT OFF 
ALTER DATABASE [estoque] SET ANSI_NULLS OFF 
ALTER DATABASE [estoque] SET ANSI_PADDING OFF 
ALTER DATABASE [estoque] SET ANSI_WARNINGS OFF 
ALTER DATABASE [estoque] SET ARITHABORT OFF 
GO

-- Configurações de comportamento
ALTER DATABASE [estoque] SET AUTO_CLOSE OFF             -- Mantém o banco aberto
ALTER DATABASE [estoque] SET AUTO_SHRINK OFF            -- Desativa auto-redução
ALTER DATABASE [estoque] SET AUTO_UPDATE_STATISTICS ON  -- Atualiza stats automaticamente
ALTER DATABASE [estoque] SET CURSOR_CLOSE_ON_COMMIT OFF 
ALTER DATABASE [estoque] SET CURSOR_DEFAULT GLOBAL 
GO

-- Configurações de concatenação e arredondamento
ALTER DATABASE [estoque] SET CONCAT_NULL_YIELDS_NULL OFF 
ALTER DATABASE [estoque] SET NUMERIC_ROUNDABORT OFF 
ALTER DATABASE [estoque] SET QUOTED_IDENTIFIER OFF 
GO

-- Configurações avançadas
ALTER DATABASE [estoque] SET RECURSIVE_TRIGGERS OFF 
ALTER DATABASE [estoque] SET ENABLE_BROKER              -- Habilita Service Broker
ALTER DATABASE [estoque] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
ALTER DATABASE [estoque] SET DATE_CORRELATION_OPTIMIZATION OFF 
ALTER DATABASE [estoque] SET TRUSTWORTHY OFF 
ALTER DATABASE [estoque] SET ALLOW_SNAPSHOT_ISOLATION OFF 
ALTER DATABASE [estoque] SET PARAMETERIZATION SIMPLE 
ALTER DATABASE [estoque] SET READ_COMMITTED_SNAPSHOT OFF 
ALTER DATABASE [estoque] SET HONOR_BROKER_PRIORITY OFF 
ALTER DATABASE [estoque] SET RECOVERY FULL              -- Modelo de recuperação completa
ALTER DATABASE [estoque] SET MULTI_USER                 -- Acesso multi-usuário
ALTER DATABASE [estoque] SET PAGE_VERIFY CHECKSUM       -- Verificação de páginas
ALTER DATABASE [estoque] SET DB_CHAINING OFF 
ALTER DATABASE [estoque] SET FILESTREAM(NON_TRANSACTED_ACCESS = OFF) 
ALTER DATABASE [estoque] SET TARGET_RECOVERY_TIME = 60 SECONDS 
ALTER DATABASE [estoque] SET DELAYED_DURABILITY = DISABLED 
ALTER DATABASE [estoque] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO

-- Configurações de armazenamento
EXEC sys.sp_db_vardecimal_storage_format N'estoque', N'ON'
GO

-- Configura o Query Store para monitoramento de performance
ALTER DATABASE [estoque] SET QUERY_STORE = ON
GO

ALTER DATABASE [estoque] SET QUERY_STORE (
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    INTERVAL_LENGTH_MINUTES = 60,
    MAX_STORAGE_SIZE_MB = 1000,
    QUERY_CAPTURE_MODE = AUTO,
    SIZE_BASED_CLEANUP_MODE = AUTO,
    MAX_PLANS_PER_QUERY = 200,
    WAIT_STATS_CAPTURE_MODE = ON
)
GO

-- =============================================
-- CRIAÇÃO DAS TABELAS
-- =============================================

USE [estoque]
GO

-- Tabela de Categorias
CREATE TABLE [dbo].[categories](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [last_modified_by] [varchar](255) NULL,
    [name] [varchar](255) NOT NULL,
    [updated_at] [datetime2](6) NULL
)
GO

-- Tabela de Produtos
CREATE TABLE [dbo].[products](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [description] [text] NULL,
    [expiration_date] [date] NULL,
    [last_modified_by] [varchar](255) NULL,
    [name] [varchar](255) NOT NULL,
    [product_code] [varchar](255) NOT NULL,
    [stock_quantity] [int] NULL,
    [unit_price] [numeric](38, 2) NOT NULL,
    [updated_at] [datetime2](6) NULL,
    [category_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([category_id]) REFERENCES [categories]([id])
) TEXTIMAGE_ON [PRIMARY]
GO

-- Tabela de Fornecedores
CREATE TABLE [dbo].[suppliers](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [cep] [varchar](255) NULL,
    [cnpj] [varchar](255) NOT NULL UNIQUE,
    [communication_preference] [varchar](255) NOT NULL,
    [contact_person] [varchar](255) NULL,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [email] [varchar](255) NOT NULL UNIQUE,
    [last_modified_by] [varchar](255) NULL,
    [phone] [varchar](255) NOT NULL,
    [social_reason] [varchar](255) NOT NULL,
    [status] [varchar](255) NULL,
    [updated_at] [datetime2](6) NULL,
    [website] [varchar](255) NULL
)
GO

-- Tabela de Relacionamento Produto-Fornecedor
CREATE TABLE [dbo].[product_supplier](
    [product_id] [varchar](255) NOT NULL,
    [supplier_id] [varchar](255) NOT NULL,
    PRIMARY KEY ([product_id], [supplier_id]),
    FOREIGN KEY ([product_id]) REFERENCES [products]([id]),
    FOREIGN KEY ([supplier_id]) REFERENCES [suppliers]([id])
)
GO

-- Tabela de Recebimentos
CREATE TABLE [dbo].[receivings](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [description] [varchar](255) NULL,
    [inventory_code] [varchar](255) NOT NULL,
    [last_modified_by] [varchar](255) NULL,
    [quantity] [int] NOT NULL,
    [receiving_date] [date] NOT NULL,
    [receiving_status] [varchar](255) NULL,
    [total_price] [numeric](10, 2) NOT NULL,
    [updated_at] [datetime2](6) NULL,
    [product_id] [varchar](255) NOT NULL,
    [supplier_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([product_id]) REFERENCES [products]([id]),
    FOREIGN KEY ([supplier_id]) REFERENCES [suppliers]([id])
)
GO

-- Tabela de Inventário
CREATE TABLE [dbo].[inventory](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [discount] [numeric](38, 2) NOT NULL,
    [exit_quantity] [int] NOT NULL,
    [inventory_code] [varchar](255) NOT NULL UNIQUE,
    [last_modified_by] [varchar](255) NULL,
    [quantity] [int] NOT NULL,
    [receivement_quantity] [int] NOT NULL,
    [updated_at] [datetime2](6) NULL,
    [product_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([product_id]) REFERENCES [products]([id])
)
GO

-- Tabela de Saídas
CREATE TABLE [dbo].[exits](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [created_by] [varchar](255) NULL,
    [exit_date] [datetime2](6) NOT NULL,
    [inventory_code] [varchar](255) NOT NULL,
    [last_modified_by] [varchar](255) NULL,
    [quantity] [int] NOT NULL,
    [exit_status] [varchar](255) NULL,
    [updated_at] [datetime2](6) NULL,
    [product_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([product_id]) REFERENCES [products]([id])
)
GO

-- Tabela de Relacionamento Inventário-Saídas
CREATE TABLE [dbo].[inventory_exits](
    [inventory_id] [varchar](255) NOT NULL,
    [exit_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([inventory_id]) REFERENCES [inventory]([id]),
    FOREIGN KEY ([exit_id]) REFERENCES [exits]([id])
)
GO

-- Tabela de Relacionamento Inventário-Recebimentos
CREATE TABLE [dbo].[inventory_receivements](
    [inventory_id] [varchar](255) NOT NULL,
    [receivement_id] [varchar](255) NOT NULL,
    FOREIGN KEY ([inventory_id]) REFERENCES [inventory]([id]),
    FOREIGN KEY ([receivement_id]) REFERENCES [receivings]([id])
)
GO

-- Tabela de Usuários
CREATE TABLE [dbo].[users](
    [id] [varchar](255) NOT NULL PRIMARY KEY,
    [created_at] [datetime2](6) NOT NULL,
    [email] [varchar](255) NOT NULL UNIQUE,
    [face_image] [varbinary](max) NULL,
    [password] [varchar](255) NULL,
    [role] [varchar](255) NOT NULL,
    [status] [varchar](255) NULL,
    [updated_at] [datetime2](6) NULL,
    [username] [varchar](255) NOT NULL UNIQUE
) TEXTIMAGE_ON [PRIMARY]
GO

-- =============================================
-- RESTRIÇÕES (CHECK CONSTRAINTS)
-- =============================================

-- Status válidos para Saídas
ALTER TABLE [exits] ADD CHECK (
    [exit_status] IN ('RETURNED', 'CANCELED', 'COMPLETED', 'PENDING')
)

-- Status válidos para Recebimentos
ALTER TABLE [receivings] ADD CHECK (
    [receiving_status] IN ('RETURNED', 'CANCELED', 'COMPLETED', 'PENDING')
)

-- Preferências de comunicação válidas para Fornecedores
ALTER TABLE [suppliers] ADD CHECK (
    [communication_preference] IN ('ANY', 'SMS', 'PHONE', 'EMAIL')
)

-- Status válidos para Fornecedores
ALTER TABLE [suppliers] ADD CHECK (
    [status] IN ('INACTIVE', 'ACTIVE')
)

-- Roles válidas para Usuários
ALTER TABLE [users] ADD CHECK (
    [role] IN ('USER', 'ADMIN')
)

-- Status válidos para Usuários
ALTER TABLE [users] ADD CHECK (
    [status] IN ('INACTIVE', 'ACTIVE')
)
GO

-- =============================================
-- PROCEDURES ARMAZENADAS
-- =============================================

CREATE PROCEDURE [dbo].[UpdateReceivementStatus]
    @id NVARCHAR(50),        
    @new_status NVARCHAR(50) 
AS
BEGIN
    -- Atualiza o status de um recebimento
    UPDATE receivings
    SET receiving_status = @new_status,  
        updated_at = GETDATE()           
    WHERE id = @id;                     

    SELECT 'Status do recebimento atualizado com sucesso' AS Message;
END;
GO

-- =============================================
-- FINALIZAÇÃO
-- =============================================

USE [master]
GO
ALTER DATABASE [estoque] SET READ_WRITE 
GO

PRINT 'Banco de dados "estoque" criado e configurado com sucesso!'
GO