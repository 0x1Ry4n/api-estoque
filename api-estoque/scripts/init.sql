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