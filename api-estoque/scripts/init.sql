IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'estoque')
BEGIN
    CREATE DATABASE estoque;
END;
GO

USE estoque;
GO

CREATE TRIGGER set_default_status_before_receiving_insert
ON receivings
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO receivings (id, product_id, supplier_id, inventory_code, description, quantity, total_price, receiving_date, receiving_status, created_at, created_by)
    SELECT 
        ISNULL(id, NEWID()),
        product_id,
        supplier_id,
        inventory_code,
        description,
        quantity,
        total_price,
        receiving_date,
        COALESCE(receiving_status, 'PENDING'),  
        created_at,
        created_by
    FROM inserted;
END;
GO


CREATE TRIGGER set_default_status_before_exit_insert
ON exits
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO exits (id, product_id, inventory_code, quantity, exit_date, exit_status, created_at, created_by)
    SELECT 
        ISNULL(id, NEWID()),
        product_id,
        inventory_code,
        quantity,
        exit_date,
        COALESCE(exit_status, 'PENDING'),  
        created_at,
        created_by
    FROM inserted;
END;
GO

CREATE OR ALTER PROCEDURE UpdateReceivementStatus
    @id NVARCHAR(50),
    @new_status NVARCHAR(50)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE receivings
        SET receiving_status = @new_status,
            updated_at = GETDATE()
        WHERE id = @id;
        
        IF @@ROWCOUNT = 0
            RAISERROR('Nenhum recebimento encontrado com o ID especificado', 16, 1);
        
        COMMIT TRANSACTION;
        
        SELECT 'Status do recebimento atualizado com sucesso' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE UpdateExitStatus
    @id NVARCHAR(50),
    @new_status NVARCHAR(50)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE exits
        SET exit_status = @new_status,
            updated_at = GETDATE()
        WHERE id = @id;
        
        IF @@ROWCOUNT = 0
            RAISERROR('Nenhuma entrada encontrada com o ID especificado', 16, 1);
        
        COMMIT TRANSACTION;
        
        SELECT 'Status da entrada atualizado com sucesso' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE UpdateUserStatus
    @id NVARCHAR(50),
    @new_status NVARCHAR(50)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE users
        SET status = @new_status,
            updated_at = GETDATE()
        WHERE id = @id;
        
        IF @@ROWCOUNT = 0
            RAISERROR('Nenhum usuário encontrado com o ID especificado', 16, 1);
        
        COMMIT TRANSACTION;
        
        SELECT 'Status de usuário atualizado com sucesso' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO


INSERT INTO [dbo].[categories] ([id], [created_at], [created_by], [last_modified_by], [name], [updated_at])
VALUES 
('cat001', GETDATE(), 'admin', 'admin', 'Eletrônicos', NULL),
('cat002', GETDATE(), 'admin', 'admin', 'Móveis', NULL),
('cat003', GETDATE(), 'admin', NULL, 'Alimentos', GETDATE()),
('cat004', GETDATE(), 'admin', NULL, 'Roupas', GETDATE()),
('cat005', GETDATE(), 'admin', 'admin', 'Ferramentas', NULL);

INSERT INTO [dbo].[suppliers] ([id], [cep], [cnpj], [communication_preference], [contact_person], [created_at], [created_by], [email], [last_modified_by], [phone], [social_reason], [status], [updated_at], [website])
VALUES 
('sup001', '01001000', '12345678000101', 'EMAIL', 'João Silva', GETDATE(), 'admin', 'joao@eletronicos.com', 'admin', '11999998888', 'Eletrônicos Ltda', 'ACTIVE', NULL, 'www.eletronicos.com'),
('sup002', '02002000', '23456789000102', 'PHONE', 'Maria Souza', GETDATE(), 'admin', 'maria@moveis.com', NULL, '11988887777', 'Móveis S.A.', 'ACTIVE', GETDATE(), 'www.moveis.com'),
('sup003', '03003000', '34567890000103', 'SMS', 'Carlos Oliveira', GETDATE(), 'admin', 'carlos@alimentos.com', 'admin', '11977776666', 'Alimentos Distribuição', 'ACTIVE', NULL, NULL),
('sup004', '04004000', '45678901000104', 'ANY', 'Ana Pereira', GETDATE(), 'admin', 'ana@roupas.com', NULL, '11966665555', 'Confecções Ana', 'ACTIVE', GETDATE(), 'www.roupasana.com'),
('sup005', '05005000', '56789012000105', 'EMAIL', 'Pedro Costa', GETDATE(), 'admin', 'pedro@ferramentas.com', 'admin', '11955554444', 'Ferramentas & Cia', 'ACTIVE', NULL, 'www.ferramentasecia.com.br');

-- INSERT INTO [dbo].[users] ([id], [created_at], [email], [face_image], [password], [role], [status], [updated_at], [username])
-- VALUES 
-- ('user001', GETDATE(), 'admin@example.com', NULL, 'root', 'ADMIN', 'ACTIVE', NULL, 'admin'),
-- ('user002', GETDATE(), 'gerente@estoque.com', NULL, 'gerente123', 'USER', 'ACTIVE', GETDATE(), 'gerente'),
-- ('user003', GETDATE(), 'func1@estoque.com', NULL, 'func1123', 'USER', 'ACTIVE', NULL, 'funcionario1'),
-- ('user004', GETDATE(), 'func2@estoque.com', NULL, 'func2123', 'USER', 'ACTIVE', GETDATE(), 'funcionario2'),
-- ('user005', GETDATE(), 'inativo@estoque.com', NULL, 'inativo123', 'USER', 'INACTIVE', NULL, 'usuarioinativo');

INSERT INTO [dbo].[products] ([id], [created_at], [created_by], [description], [expiration_date], [last_modified_by], [name], [product_code], [stock_quantity], [unit_price], [updated_at], [category_id])
VALUES 
('prod001', GETDATE(), 'admin', 'Smartphone modelo X', NULL, 'admin', 'Smartphone X', 'SMX001', 50, 2500.00, NULL, 'cat001'),
('prod002', GETDATE(), 'admin', 'Sofá 3 lugares', NULL, NULL, 'Sofá Retrátil', 'SOFA001', 20, 1500.00, GETDATE(), 'cat002'),
('prod003', GETDATE(), 'admin', 'Arroz integral 5kg', '2024-12-31', 'admin', 'Arroz Integral', 'ARROZ001', 100, 25.00, NULL, 'cat003'),
('prod004', GETDATE(), 'admin', 'Camiseta branca tamanho M', NULL, NULL, 'Camiseta Básica', 'CAM001', 200, 39.90, GETDATE(), 'cat004'),
('prod005', GETDATE(), 'admin', 'Martelo profissional', NULL, 'admin', 'Martelo', 'MART001', 30, 45.50, NULL, 'cat005'),
('prod006', GETDATE(), 'admin', 'Notebook i7', NULL, NULL, 'Notebook Pro', 'NOTE001', 15, 4500.00, GETDATE(), 'cat001'),
('prod007', GETDATE(), 'admin', 'Feijão carioca 1kg', '2024-10-31', 'admin', 'Feijão', 'FEIJAO001', 80, 8.50, NULL, 'cat003');

INSERT INTO [dbo].[product_supplier] ([product_id], [supplier_id])
VALUES 
('prod001', 'sup001'),
('prod002', 'sup002'),
('prod003', 'sup003'),
('prod004', 'sup004'),
('prod005', 'sup005'),
('prod006', 'sup001'),
('prod007', 'sup003');

INSERT INTO [dbo].[inventory] ([id], [created_at], [created_by], [discount], [exit_quantity], [inventory_code], [last_modified_by], [quantity], [receivement_quantity], [updated_at], [product_id])
VALUES 
('inv001', GETDATE(), 'admin', 0.00, 0, 'INV-SMX001-001', 'admin', 50, 50, NULL, 'prod001'),
('inv002', GETDATE(), 'admin', 0.00, 0, 'INV-SOFA001-001', NULL, 20, 20, GETDATE(), 'prod002'),
('inv003', GETDATE(), 'admin', 0.00, 0, 'INV-ARROZ001-001', 'admin', 100, 100, NULL, 'prod003'),
('inv004', GETDATE(), 'admin', 0.00, 0, 'INV-CAM001-001', NULL, 200, 200, GETDATE(), 'prod004'),
('inv005', GETDATE(), 'admin', 0.00, 0, 'INV-MART001-001', 'admin', 30, 30, NULL, 'prod005'),
('inv006', GETDATE(), 'admin', 0.00, 0, 'INV-NOTE001-001', NULL, 15, 15, GETDATE(), 'prod006'),
('inv007', GETDATE(), 'admin', 0.00, 0, 'INV-FEIJAO001-001', 'admin', 80, 80, NULL, 'prod007');

INSERT INTO [dbo].[receivings] ([id], [created_at], [created_by], [description], [inventory_code], [last_modified_by], [quantity], [receiving_date], [receiving_status], [total_price], [updated_at], [product_id], [supplier_id])
VALUES 
('rec001', GETDATE(), 'admin', 'Recebimento inicial', 'INV-SMX001-001', 'admin', 50, '2023-01-15', 'COMPLETED', 125000.00, NULL, 'prod001', 'sup001'),
('rec002', GETDATE(), 'admin', 'Recebimento inicial', 'INV-SOFA001-001', NULL, 20, '2023-01-16', 'COMPLETED', 30000.00, GETDATE(), 'prod002', 'sup002'),
('rec003', GETDATE(), 'admin', 'Recebimento inicial', 'INV-ARROZ001-001', 'admin', 100, '2023-01-17', 'COMPLETED', 2500.00, NULL, 'prod003', 'sup003'),
('rec004', GETDATE(), 'admin', 'Recebimento inicial', 'INV-CAM001-001', NULL, 200, '2023-01-18', 'COMPLETED', 7980.00, GETDATE(), 'prod004', 'sup004'),
('rec005', GETDATE(), 'admin', 'Recebimento inicial', 'INV-MART001-001', 'admin', 30, '2023-01-19', 'COMPLETED', 1365.00, NULL, 'prod005', 'sup005'),
('rec006', GETDATE(), 'admin', 'Recebimento adicional', 'INV-NOTE001-001', NULL, 15, '2023-02-01', 'COMPLETED', 67500.00, GETDATE(), 'prod006', 'sup001'),
('rec007', GETDATE(), 'admin', 'Recebimento adicional', 'INV-FEIJAO001-001', 'admin', 80, '2023-02-02', 'COMPLETED', 680.00, NULL, 'prod007', 'sup003');

INSERT INTO [dbo].[inventory_receivements] ([inventory_id], [receivement_id])
VALUES 
('inv001', 'rec001'),
('inv002', 'rec002'),
('inv003', 'rec003'),
('inv004', 'rec004'),
('inv005', 'rec005'),
('inv006', 'rec006'),
('inv007', 'rec007');

INSERT INTO [dbo].[exits] ([id], [created_at], [created_by], [exit_date], [inventory_code], [last_modified_by], [quantity], [exit_status], [updated_at], [product_id])
VALUES 
('exit001', GETDATE(), 'admin', '2023-02-10', 'INV-SMX001-001', 'admin', 5, 'COMPLETED', NULL, 'prod001'),
('exit002', GETDATE(), 'admin', '2023-02-11', 'INV-SOFA001-001', NULL, 2, 'COMPLETED', GETDATE(), 'prod002'),
('exit003', GETDATE(), 'admin', '2023-02-12', 'INV-ARROZ001-001', 'admin', 10, 'COMPLETED', NULL, 'prod003'),
('exit004', GETDATE(), 'admin', '2023-02-13', 'INV-CAM001-001', NULL, 20, 'PENDING', GETDATE(), 'prod004'),
('exit005', GETDATE(), 'admin', '2023-02-14', 'INV-MART001-001', 'admin', 3, 'COMPLETED', NULL, 'prod005'),
('exit006', GETDATE(), 'admin', '2023-02-15', 'INV-NOTE001-001', NULL, 1, 'CANCELED', GETDATE(), 'prod006'),
('exit007', GETDATE(), 'admin', '2023-02-16', 'INV-FEIJAO001-001', 'admin', 5, 'RETURNED', NULL, 'prod007');

INSERT INTO [dbo].[inventory_exits] ([inventory_id], [exit_id])
VALUES 
('inv001', 'exit001'),
('inv002', 'exit002'),
('inv003', 'exit003'),
('inv004', 'exit004'),
('inv005', 'exit005'),
('inv006', 'exit006'),
('inv007', 'exit007');

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 5, [quantity] = 45, [updated_at] = GETDATE()
WHERE [id] = 'inv001';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 2, [quantity] = 18, [updated_at] = GETDATE()
WHERE [id] = 'inv002';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 10, [quantity] = 90, [updated_at] = GETDATE()
WHERE [id] = 'inv003';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 20, [quantity] = 180, [updated_at] = GETDATE()
WHERE [id] = 'inv004';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 3, [quantity] = 27, [updated_at] = GETDATE()
WHERE [id] = 'inv005';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 0, [quantity] = 15, [updated_at] = GETDATE()
WHERE [id] = 'inv006';

UPDATE [dbo].[inventory] SET 
[exit_quantity] = 0, [quantity] = 80, [updated_at] = GETDATE()
WHERE [id] = 'inv007';