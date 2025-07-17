IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'estoque')
BEGIN
    CREATE DATABASE estoque;
END;
GO

USE estoque;
GO

-- Triggers

IF NOT EXISTS (
    SELECT * FROM sys.triggers WHERE name = 'set_default_status_after_receiving_insert'
)
BEGIN
    EXEC('
        CREATE TRIGGER set_default_status_after_receiving_insert
        ON receivings
        AFTER INSERT
        AS
        BEGIN
            UPDATE r
            SET receiving_status = COALESCE(i.receiving_status, ''PENDING'')
            FROM receivings r
            INNER JOIN inserted i ON r.id = i.id;
        END
    ');
END;
GO

IF NOT EXISTS (
    SELECT * FROM sys.triggers WHERE name = 'set_default_status_before_exit_insert'
)
BEGIN
    EXEC('
        CREATE TRIGGER set_default_status_before_exit_insert
        ON exits
        AFTER INSERT
        AS
        BEGIN
            UPDATE e
            SET exit_status = COALESCE(i.exit_status, ''PENDING'')
            FROM exits e
            INNER JOIN inserted i ON e.id = i.id;
        END
    ');
END;
GO

-- Procedures

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

-- Views 

CREATE VIEW v_produtos_fat AS  
    SELECT  
        MAX(p.id) AS id_produto,   
        p.name AS nome_produto,  
        MAX(e.name) AS nome_categoria,  
        SUM(i.quantity) AS quantidade_estoque,  
        MAX(p.unit_price) AS preco_unitario,  
        SUM(i.quantity * (p.unit_price - i.discount)) AS valor_faturamento,  
        ex.exit_date AS data_saida  
    FROM exits ex  
    INNER JOIN products p ON p.id = ex.product_id  
    INNER JOIN inventory i ON i.product_id = ex.product_id  
    INNER JOIN categories e ON e.id = p.category_id  
    GROUP BY p.name, ex.exit_date;  
GO 

CREATE VIEW v_movimentacao_est AS  
    SELECT  
        p.id AS id_produto,  
        p.name AS nome_produto,  
        e.name AS nome_categoria,  
        SUM(i.quantity) AS quantidade_estoque,  
        MAX(p.unit_price) AS preco_unitario,  
        SUM(i.quantity * (p.unit_price - i.discount)) AS valor_faturamento, 
        AVG(DATEDIFF(DAY, rc.receiving_date, ex.exit_date)) AS media_dias_para_saida FROM exits ex  
    INNER JOIN products p ON p.id = ex.product_id  
    INNER JOIN inventory i ON i.product_id = p.id  
    INNER JOIN categories e ON e.id = p.category_id  
    INNER JOIN receivings rc ON rc.product_id = p.id  
    GROUP BY p.id, p.name, e.name; 
GO 

-- Inserts 

INSERT INTO [dbo].[categories] ([id], [created_at], [created_by], [last_modified_by], [name], [updated_at])
VALUES 
('cat001', GETDATE(), 'admin', 'admin', 'Smartphones', NULL),
('cat002', GETDATE(), 'admin', 'admin', 'Notebooks', NULL),
('cat003', GETDATE(), 'admin', NULL, 'Tablets', GETDATE()),
('cat004', GETDATE(), 'admin', NULL, 'Monitores', GETDATE()),
('cat005', GETDATE(), 'admin', 'admin', 'Periféricos', NULL),
('cat006', GETDATE(), 'admin', 'admin', 'Componentes', NULL),
('cat007', GETDATE(), 'admin', NULL, 'Redes', GETDATE()),
('cat008', GETDATE(), 'admin', NULL, 'Impressoras', GETDATE()),
('cat009', GETDATE(), 'admin', 'admin', 'Armazenamento', NULL),
('cat010', GETDATE(), 'admin', 'admin', 'Acessórios', NULL),
('cat011', GETDATE(), 'admin', NULL, 'Software', GETDATE()),
('cat012', GETDATE(), 'admin', NULL, 'Gaming', GETDATE()),
('cat013', GETDATE(), 'admin', 'admin', 'Smart Home', NULL),
('cat014', GETDATE(), 'admin', 'admin', 'Drones', NULL),
('cat015', GETDATE(), 'admin', NULL, 'Realidade Virtual', GETDATE()),
('cat016', GETDATE(), 'admin', NULL, 'Servidores', GETDATE()),
('cat017', GETDATE(), 'admin', 'admin', 'Câmeras', NULL),
('cat018', GETDATE(), 'admin', 'admin', 'Áudio', NULL),
('cat019', GETDATE(), 'admin', NULL, 'Wearables', GETDATE()),
('cat020', GETDATE(), 'admin', NULL, 'Robótica', GETDATE()),
('cat021', GETDATE(), 'admin', 'admin', 'IoT', NULL),
('cat022', GETDATE(), 'admin', 'admin', 'Energia', NULL),
('cat023', GETDATE(), 'admin', NULL, 'Proteção', GETDATE()),
('cat024', GETDATE(), 'admin', NULL, 'Cabos', GETDATE()),
('cat025', GETDATE(), 'admin', 'admin', 'Refrigeração', NULL);

INSERT INTO [dbo].[suppliers] ([id], [cep], [cnpj], [communication_preference], [contact_person], [created_at], [created_by], [email], [last_modified_by], [phone], [social_reason], [status], [updated_at], [website])
VALUES 
('sup001', '01001000', '12345678000101', 'EMAIL', 'João Silva', GETDATE(), 'admin', 'joao@techparts.com', 'admin', '11999998888', 'TechParts Ltda', 'ACTIVE', NULL, 'www.techparts.com'),
('sup002', '02002000', '23456789000102', 'PHONE', 'Maria Souza', GETDATE(), 'admin', 'maria@digicom.com', NULL, '11988887777', 'DigiCom S.A.', 'ACTIVE', GETDATE(), 'www.digicom.com'),
('sup003', '03003000', '34567890000103', 'SMS', 'Carlos Oliveira', GETDATE(), 'admin', 'carlos@chipstore.com', 'admin', '11977776666', 'ChipStore Distribuição', 'ACTIVE', NULL, 'www.chipstore.com.br'),
('sup004', '04004000', '45678901000104', 'ANY', 'Ana Pereira', GETDATE(), 'admin', 'ana@netgadgets.com', NULL, '11966665555', 'NetGadgets Inc', 'ACTIVE', GETDATE(), 'www.netgadgets.com'),
('sup005', '05005000', '56789012000105', 'EMAIL', 'Pedro Costa', GETDATE(), 'admin', 'pedro@byteware.com', 'admin', '11955554444', 'ByteWare & Cia', 'ACTIVE', NULL, 'www.byteware.com.br'),
('sup006', '06006000', '67890123000106', 'EMAIL', 'Fernanda Lima', GETDATE(), 'admin', 'fernanda@megatech.com', NULL, '11944443333', 'MegaTech Solutions', 'ACTIVE', GETDATE(), 'www.megatech.com'),
('sup007', '07007000', '78901234000107', 'PHONE', 'Ricardo Santos', GETDATE(), 'admin', 'ricardo@inovatech.com', 'admin', '11933332222', 'InovaTech Ltda', 'ACTIVE', NULL, 'www.inovatech.com.br'),
('sup008', '08008000', '89012345000108', 'SMS', 'Patricia Alves', GETDATE(), 'admin', 'patricia@cybernet.com', NULL, '11922221111', 'CyberNet Systems', 'ACTIVE', GETDATE(), 'www.cybernet.com'),
('sup009', '09009000', '90123456000109', 'ANY', 'Marcos Rocha', GETDATE(), 'admin', 'marcos@futuretech.com', 'admin', '11911110000', 'FutureTech Corp', 'ACTIVE', NULL, 'www.futuretech.com'),
('sup010', '10010000', '01234567000110', 'EMAIL', 'Juliana Mendes', GETDATE(), 'admin', 'juliana@quantum.com', NULL, '11900009999', 'Quantum Devices', 'ACTIVE', GETDATE(), 'www.quantumdev.com'),
('sup011', '11011000', '12345678000111', 'PHONE', 'Gustavo Neves', GETDATE(), 'admin', 'gustavo@alphatech.com', 'admin', '11999998887', 'AlphaTech Industries', 'ACTIVE', NULL, 'www.alphatech.com.br'),
('sup012', '12012000', '23456789000112', 'SMS', 'Camila Porto', GETDATE(), 'admin', 'camila@betatech.com', NULL, '11988887776', 'BetaTech Solutions', 'ACTIVE', GETDATE(), 'www.betatech.com'),
('sup013', '13013000', '34567890000113', 'ANY', 'Roberto Dias', GETDATE(), 'admin', 'roberto@gammatech.com', 'admin', '11977776665', 'GammaTech Ltda', 'ACTIVE', NULL, 'www.gammatech.com'),
('sup014', '14014000', '45678901000114', 'EMAIL', 'Luciana Moraes', GETDATE(), 'admin', 'luciana@omegacom.com', NULL, '11966665554', 'OmegaCom Systems', 'ACTIVE', GETDATE(), 'www.omegacom.com'),
('sup015', '15015000', '56789012000115', 'PHONE', 'Felipe Castro', GETDATE(), 'admin', 'felipe@techgen.com', 'admin', '11955554443', 'TechGen Innovations', 'ACTIVE', NULL, 'www.techgen.com.br'),
('sup016', '16016000', '67890123000116', 'SMS', 'Vanessa Lopes', GETDATE(), 'admin', 'vanessa@nextgen.com', NULL, '11944443332', 'NextGen Devices', 'ACTIVE', GETDATE(), 'www.nextgen.com'),
('sup017', '17017000', '78901234000117', 'ANY', 'Bruno Cardoso', GETDATE(), 'admin', 'bruno@ultratech.com', 'admin', '11933332221', 'UltraTech Corp', 'ACTIVE', NULL, 'www.ultratech.com'),
('sup018', '18018000', '89012345000118', 'EMAIL', 'Tatiana Reis', GETDATE(), 'admin', 'tatiana@nanotech.com', NULL, '11922221110', 'NanoTech Solutions', 'ACTIVE', GETDATE(), 'www.nanotech.com'),
('sup019', '19019000', '90123456000119', 'PHONE', 'Diego Martins', GETDATE(), 'admin', 'diego@pixeltech.com', 'admin', '11911110009', 'PixelTech Ltda', 'ACTIVE', NULL, 'www.pixeltech.com.br'),
('sup020', '20020000', '01234567000120', 'SMS', 'Renata Campos', GETDATE(), 'admin', 'renata@bitware.com', NULL, '11900009998', 'BitWare Systems', 'ACTIVE', GETDATE(), 'www.bitware.com'),
('sup021', '21021000', '12345678000121', 'ANY', 'Alexandre Rios', GETDATE(), 'admin', 'alexandre@coretech.com', 'admin', '11999998886', 'CoreTech Industries', 'ACTIVE', NULL, 'www.coretech.com'),
('sup022', '22022000', '23456789000122', 'EMAIL', 'Isabela Duarte', GETDATE(), 'admin', 'isabela@logictech.com', NULL, '11988887775', 'LogicTech Solutions', 'ACTIVE', GETDATE(), 'www.logictech.com'),
('sup023', '23023000', '34567890000123', 'PHONE', 'Rodrigo Pires', GETDATE(), 'admin', 'rodrigo@apextech.com', 'admin', '11977776664', 'ApexTech Corp', 'ACTIVE', NULL, 'www.apextech.com.br'),
('sup024', '24024000', '45678901000124', 'SMS', 'Mariana Costa', GETDATE(), 'admin', 'mariana@vertex.com', NULL, '11966665553', 'Vertex Technologies', 'ACTIVE', GETDATE(), 'www.vertex.com'),
('sup025', '25025000', '56789012000125', 'ANY', 'Leonardo Moura', GETDATE(), 'admin', 'leonardo@zenith.com', 'admin', '11955554442', 'Zenith Electronics', 'ACTIVE', NULL, 'www.zenith.com.br');


-- Os inserts de usuário são feitos pelo spring boot 

-- INSERT INTO [dbo].[users] ([id], [created_at], [email], [face_image], [password], [role], [status], [updated_at], [username])
-- VALUES 
-- ('user001', GETDATE(), 'admin@example.com', NULL, 'root', 'ADMIN', 'ACTIVE', NULL, 'admin'),
-- ('user002', GETDATE(), 'gerente@estoque.com', NULL, 'gerente123', 'USER', 'ACTIVE', GETDATE(), 'gerente'),
-- ('user003', GETDATE(), 'func1@estoque.com', NULL, 'func1123', 'USER', 'ACTIVE', NULL, 'funcionario1'),
-- ('user004', GETDATE(), 'func2@estoque.com', NULL, 'func2123', 'USER', 'ACTIVE', GETDATE(), 'funcionario2'),
-- ('user005', GETDATE(), 'inativo@estoque.com', NULL, 'inativo123', 'USER', 'INACTIVE', NULL, 'usuarioinativo');

INSERT INTO [dbo].[products] ([id], [created_at], [created_by], [description], [expiration_date], [last_modified_by], [name], [product_code], [stock_quantity], [unit_price], [updated_at], [category_id])
VALUES 
-- Smartphones
('prod001', GETDATE(), 'admin', 'Smartphone flagship com câmera de 108MP', NULL, 'admin', 'Smartphone Galaxy S23', 'SM-GS23', 150, 4999.00, NULL, 'cat001'),
('prod002', GETDATE(), 'admin', 'Smartphone premium com chip M2', NULL, NULL, 'iPhone 15 Pro', 'SM-IP15P', 120, 6999.00, GETDATE(), 'cat001'),
('prod003', GETDATE(), 'admin', 'Smartphone intermediário 128GB', NULL, 'admin', 'Xiaomi Redmi Note 12', 'SM-XRN12', 300, 1899.00, NULL, 'cat001'),
('prod004', GETDATE(), 'admin', 'Smartphone Android puro 256GB', NULL, NULL, 'Pixel 7 Pro', 'SM-PX7P', 80, 4299.00, GETDATE(), 'cat001'),
('prod005', GETDATE(), 'admin', 'Smartphone dobrável 512GB', NULL, 'admin', 'Galaxy Z Fold 5', 'SM-GZF5', 50, 8999.00, NULL, 'cat001'),

-- Notebooks
('prod006', GETDATE(), 'admin', 'Notebook i7 16GB 1TB SSD', NULL, NULL, 'Dell XPS 15', 'NB-DXPS15', 60, 8999.00, GETDATE(), 'cat002'),
('prod007', GETDATE(), 'admin', 'Notebook gamer RTX 4080', NULL, 'admin', 'Asus ROG Strix', 'NB-AROGS', 40, 15999.00, NULL, 'cat002'),
('prod008', GETDATE(), 'admin', 'Notebook ultraleve 13"', NULL, NULL, 'MacBook Air M2', 'NB-MBA2', 100, 7999.00, GETDATE(), 'cat002'),
('prod009', GETDATE(), 'admin', 'Notebook 2-em-1 touchscreen', NULL, 'admin', 'Lenovo Yoga 9i', 'NB-LY9I', 45, 7499.00, NULL, 'cat002'),
('prod010', GETDATE(), 'admin', 'Notebook empresarial durável', NULL, NULL, 'HP EliteBook', 'NB-HEB', 70, 6599.00, GETDATE(), 'cat002'),

-- Tablets
('prod011', GETDATE(), 'admin', 'Tablet premium 12.9"', NULL, 'admin', 'iPad Pro M2', 'TB-IPPM2', 55, 8999.00, NULL, 'cat003'),
('prod012', GETDATE(), 'admin', 'Tablet Android 11" 256GB', NULL, NULL, 'Samsung Tab S8', 'TB-STS8', 90, 4299.00, GETDATE(), 'cat003'),
('prod013', GETDATE(), 'admin', 'Tablet econômico 10"', NULL, 'admin', 'Amazon Fire HD', 'TB-AFHD', 200, 899.00, NULL, 'cat003'),
('prod014', GETDATE(), 'admin', 'Tablet com caneta inclusa', NULL, NULL, 'Microsoft Surface Pro 9', 'TB-MSP9', 40, 9999.00, GETDATE(), 'cat003'),
('prod015', GETDATE(), 'admin', 'Tablet infantil resistente', NULL, 'admin', 'Lenovo Tab M10', 'TB-LTM10', 120, 1299.00, NULL, 'cat003'),

-- Monitores
('prod016', GETDATE(), 'admin', 'Monitor 4K 32" IPS', NULL, NULL, 'LG UltraFine 32"', 'MN-LGUF32', 75, 3299.00, GETDATE(), 'cat004'),
('prod017', GETDATE(), 'admin', 'Monitor gamer 240Hz', NULL, 'admin', 'Asus ROG Swift', 'MN-AROGS', 50, 4999.00, NULL, 'cat004'),
('prod018', GETDATE(), 'admin', 'Monitor curvo 34"', NULL, NULL, 'Samsung Odyssey', 'MN-SO34', 40, 4299.00, GETDATE(), 'cat004'),
('prod019', GETDATE(), 'admin', 'Monitor profissional 27"', NULL, 'admin', 'Dell Ultrasharp', 'MN-DU27', 60, 2899.00, NULL, 'cat004'),
('prod020', GETDATE(), 'admin', 'Monitor portátil 15.6"', NULL, NULL, 'ASUS ZenScreen', 'MN-AZS', 85, 1499.00, GETDATE(), 'cat004'),

-- Periféricos
('prod021', GETDATE(), 'admin', 'Teclado mecânico RGB', NULL, 'admin', 'Logitech G915', 'PR-LG915', 120, 1299.00, NULL, 'cat005'),
('prod022', GETDATE(), 'admin', 'Mouse sem fio ergonômico', NULL, NULL, 'Microsoft Sculpt', 'PR-MSS', 180, 399.00, GETDATE(), 'cat005'),
('prod023', GETDATE(), 'admin', 'Headset com cancelamento de ruído', NULL, 'admin', 'Sony WH-1000XM5', 'PR-SWHX5', 90, 2299.00, NULL, 'cat005'),
('prod024', GETDATE(), 'admin', 'Webcam 4K com microfone', NULL, NULL, 'Logitech Brio', 'PR-LBRIO', 110, 899.00, GETDATE(), 'cat005'),
('prod025', GETDATE(), 'admin', 'Hub USB-C 7 portas', NULL, 'admin', 'Anker PowerExpand', 'PR-APEX', 200, 349.00, NULL, 'cat005'),

-- Componentes
('prod026', GETDATE(), 'admin', 'Placa de vídeo RTX 4090', NULL, NULL, 'NVIDIA RTX 4090', 'CP-NRTX4090', 30, 12999.00, GETDATE(), 'cat006'),
('prod027', GETDATE(), 'admin', 'Processador i9 13900K', NULL, 'admin', 'Intel Core i9', 'CP-ICI9', 45, 4299.00, NULL, 'cat006'),
('prod028', GETDATE(), 'admin', 'Memória RAM 32GB DDR5', NULL, NULL, 'Corsair Vengeance', 'CP-CV32', 150, 999.00, GETDATE(), 'cat006'),
('prod029', GETDATE(), 'admin', 'SSD NVMe 2TB', NULL, 'admin', 'Samsung 980 Pro', 'CP-S980P', 100, 1299.00, NULL, 'cat006'),
('prod030', GETDATE(), 'admin', 'Placa-mãe AM5', NULL, NULL, 'Asus ROG X670E', 'CP-ARX670', 40, 3299.00, GETDATE(), 'cat006'),

-- Redes
('prod031', GETDATE(), 'admin', 'Roteador Wi-Fi 6', NULL, 'admin', 'TP-Link Archer AX6000', 'RN-TPAX60', 80, 1299.00, NULL, 'cat007'),
('prod032', GETDATE(), 'admin', 'Switch 8 portas Gigabit', NULL, NULL, 'Netgear GS308', 'RN-NGS308', 120, 299.00, GETDATE(), 'cat007'),
('prod033', GETDATE(), 'admin', 'Placa de rede 10Gbps', NULL, 'admin', 'Asus XG-C100C', 'RN-AXG10', 50, 899.00, NULL, 'cat007'),
('prod034', GETDATE(), 'admin', 'Extensor Wi-Fi mesh', NULL, NULL, 'Deco X20', 'RN-DX20', 90, 799.00, GETDATE(), 'cat007'),
('prod035', GETDATE(), 'admin', 'Modem DOCSIS 3.1', NULL, 'admin', 'Motorola MB8600', 'RN-MMB86', 60, 699.00, NULL, 'cat007'),

-- Impressoras
('prod036', GETDATE(), 'admin', 'Impressora multifuncional', NULL, NULL, 'HP OfficeJet Pro', 'IP-HPOJP', 70, 1499.00, GETDATE(), 'cat008'),
('prod037', GETDATE(), 'admin', 'Impressora laser monocromática', NULL, 'admin', 'Brother HL-L2350DW', 'IP-BHL235', 85, 999.00, NULL, 'cat008'),
('prod038', GETDATE(), 'admin', 'Impressora térmica para nota', NULL, NULL, 'Epson TM-T20', 'IP-ETMT20', 110, 1299.00, GETDATE(), 'cat008'),
('prod039', GETDATE(), 'admin', 'Plotadora A0', NULL, 'admin', 'Canon iPF785', 'IP-CIPF785', 15, 8999.00, NULL, 'cat008'),
('prod040', GETDATE(), 'admin', 'Impressora de etiquetas', NULL, NULL, 'Zebra ZD420', 'IP-ZZD420', 50, 3299.00, GETDATE(), 'cat008'),

-- Armazenamento
('prod041', GETDATE(), 'admin', 'HD Externo 5TB USB 3.0', NULL, 'admin', 'WD My Passport', 'ST-WDMP5', 130, 699.00, NULL, 'cat009'),
('prod042', GETDATE(), 'admin', 'SSD Externo 1TB USB-C', NULL, NULL, 'Samsung T7', 'ST-ST71', 95, 599.00, GETDATE(), 'cat009'),
('prod043', GETDATE(), 'admin', 'NAS 4 bay 16TB', NULL, 'admin', 'Synology DS920+', 'ST-SDS920', 25, 4299.00, NULL, 'cat009'),
('prod044', GETDATE(), 'admin', 'Pen drive 256GB USB 3.2', NULL, NULL, 'Sandisk Extreme', 'ST-SE256', 200, 199.00, GETDATE(), 'cat009'),
('prod045', GETDATE(), 'admin', 'Cartão microSD 512GB', NULL, 'admin', 'Samsung Evo Plus', 'ST-SEP512', 180, 399.00, NULL, 'cat009'),

-- Acessórios
('prod046', GETDATE(), 'admin', 'Capa para iPad Pro', NULL, NULL, 'Apple Smart Folio', 'AC-ASF', 150, 499.00, GETDATE(), 'cat010'),
('prod047', GETDATE(), 'admin', 'Suporte para notebook', NULL, 'admin', 'Rain Design mStand', 'AC-RDM', 90, 349.00, NULL, 'cat010'),
('prod048', GETDATE(), 'admin', 'Dock station USB-C', NULL, NULL, 'CalDigit TS3 Plus', 'AC-CTSP', 60, 1299.00, GETDATE(), 'cat010'),
('prod049', GETDATE(), 'admin', 'Carregador 100W GaN', NULL, 'admin', 'Anker 736', 'AC-A736', 120, 499.00, NULL, 'cat010'),
('prod050', GETDATE(), 'admin', 'Pelicula vidro temperado', NULL, NULL, 'Whitestone Dome', 'AC-WDS', 250, 199.00, GETDATE(), 'cat010');

INSERT INTO [dbo].[product_supplier] ([product_id], [supplier_id])
VALUES 
-- Smartphones
('prod001', 'sup001'), ('prod001', 'sup002'),
('prod002', 'sup003'), ('prod002', 'sup004'),
('prod003', 'sup005'), ('prod003', 'sup006'),
('prod004', 'sup007'), ('prod004', 'sup008'),
('prod005', 'sup009'), ('prod005', 'sup010'),

-- Notebooks
('prod006', 'sup011'), ('prod006', 'sup012'),
('prod007', 'sup013'), ('prod007', 'sup014'),
('prod008', 'sup015'), ('prod008', 'sup016'),
('prod009', 'sup017'), ('prod009', 'sup018'),
('prod010', 'sup019'), ('prod010', 'sup020'),

-- Tablets
('prod011', 'sup021'), ('prod011', 'sup022'),
('prod012', 'sup023'), ('prod012', 'sup024'),
('prod013', 'sup025'), ('prod013', 'sup001'),
('prod014', 'sup002'), ('prod014', 'sup003'),
('prod015', 'sup004'), ('prod015', 'sup005'),

-- Monitores
('prod016', 'sup006'), ('prod016', 'sup007'),
('prod017', 'sup008'), ('prod017', 'sup009'),
('prod018', 'sup010'), ('prod018', 'sup011'),
('prod019', 'sup012'), ('prod019', 'sup013'),
('prod020', 'sup014'), ('prod020', 'sup015'),

-- Periféricos
('prod021', 'sup016'), ('prod021', 'sup017'),
('prod022', 'sup018'), ('prod022', 'sup019'),
('prod023', 'sup020'), ('prod023', 'sup021'),
('prod024', 'sup022'), ('prod024', 'sup023'),
('prod025', 'sup024'), ('prod025', 'sup025'),

-- Componentes
('prod026', 'sup001'), ('prod026', 'sup002'),
('prod027', 'sup003'), ('prod027', 'sup004'),
('prod028', 'sup005'), ('prod028', 'sup006'),
('prod029', 'sup007'), ('prod029', 'sup008'),
('prod030', 'sup009'), ('prod030', 'sup010'),

-- Redes
('prod031', 'sup011'), ('prod031', 'sup012'),
('prod032', 'sup013'), ('prod032', 'sup014'),
('prod033', 'sup015'), ('prod033', 'sup016'),
('prod034', 'sup017'), ('prod034', 'sup018'),
('prod035', 'sup019'), ('prod035', 'sup020'),

-- Impressoras
('prod036', 'sup021'), ('prod036', 'sup022'),
('prod037', 'sup023'), ('prod037', 'sup024'),
('prod038', 'sup025'), ('prod038', 'sup001'),
('prod039', 'sup002'), ('prod039', 'sup003'),
('prod040', 'sup004'), ('prod040', 'sup005'),

-- Armazenamento
('prod041', 'sup006'), ('prod041', 'sup007'),
('prod042', 'sup008'), ('prod042', 'sup009'),
('prod043', 'sup010'), ('prod043', 'sup011'),
('prod044', 'sup012'), ('prod044', 'sup013'),
('prod045', 'sup014'), ('prod045', 'sup015'),

-- Acessórios
('prod046', 'sup016'), ('prod046', 'sup017'),
('prod047', 'sup018'), ('prod047', 'sup019'),
('prod048', 'sup020'), ('prod048', 'sup021'),
('prod049', 'sup022'), ('prod049', 'sup023'),
('prod050', 'sup024'), ('prod050', 'sup025');

INSERT INTO [dbo].[inventory] ([id], [created_at], [created_by], [discount], [exit_quantity], [inventory_code], [last_modified_by], [quantity], [receivement_quantity], [updated_at], [product_id])
VALUES  
-- Smartphones
('inv001', GETDATE(), 'admin', 0.00, 15, 'INV-SMGS23-001', 'admin', 135, 150, NULL, 'prod001'),
('inv002', GETDATE(), 'admin', 0.00, 8, 'INV-SMIP15P-001', NULL, 112, 120, GETDATE(), 'prod002'),
('inv003', GETDATE(), 'admin', 0.00, 25, 'INV-SMXRN12-001', 'admin', 275, 300, NULL, 'prod003'),
('inv004', GETDATE(), 'admin', 0.00, 12, 'INV-SMPX7P-001', NULL, 68, 80, GETDATE(), 'prod004'),
('inv005', GETDATE(), 'admin', 0.00, 5, 'INV-SMGZF5-001', 'admin', 45, 50, NULL, 'prod005'),

-- Notebooks
('inv006', GETDATE(), 'admin', 0.00, 10, 'INV-NBDXPS15-001', NULL, 50, 60, GETDATE(), 'prod006'),
('inv007', GETDATE(), 'admin', 0.00, 5, 'INV-NBAROGS-001', 'admin', 35, 40, NULL, 'prod007'),
('inv008', GETDATE(), 'admin', 0.00, 15, 'INV-NBMBA2-001', NULL, 85, 100, GETDATE(), 'prod008'),
('inv009', GETDATE(), 'admin', 0.00, 8, 'INV-NBLY9I-001', 'admin', 37, 45, NULL, 'prod009'),
('inv010', GETDATE(), 'admin', 0.00, 12, 'INV-NBHEB-001', NULL, 58, 70, GETDATE(), 'prod010'),

-- Tablets
('inv011', GETDATE(), 'admin', 0.00, 10, 'INV-TBIPPM2-001', 'admin', 45, 55, NULL, 'prod011'),
('inv012', GETDATE(), 'admin', 0.00, 15, 'INV-TBSTS8-001', NULL, 75, 90, GETDATE(), 'prod012'),
('inv013', GETDATE(), 'admin', 0.00, 30, 'INV-TBAFHD-001', 'admin', 170, 200, NULL, 'prod013'),
('inv014', GETDATE(), 'admin', 0.00, 5, 'INV-TBMSP9-001', NULL, 35, 40, GETDATE(), 'prod014'),
('inv015', GETDATE(), 'admin', 0.00, 20, 'INV-TBLTM10-001', 'admin', 100, 120, NULL, 'prod015'),

-- Monitores
('inv016', GETDATE(), 'admin', 0.00, 15, 'INV-MNLGUF32-001', NULL, 60, 75, GETDATE(), 'prod016'),
('inv017', GETDATE(), 'admin', 0.00, 8, 'INV-MNAROGS-001', 'admin', 42, 50, NULL, 'prod017'),
('inv018', GETDATE(), 'admin', 0.00, 5, 'INV-MNSO34-001', NULL, 35, 40, GETDATE(), 'prod018'),
('inv019', GETDATE(), 'admin', 0.00, 10, 'INV-MNDU27-001', 'admin', 50, 60, NULL, 'prod019'),
('inv020', GETDATE(), 'admin', 0.00, 15, 'INV-MNAZS-001', NULL, 70, 85, GETDATE(), 'prod020'),

-- Periféricos
('inv021', GETDATE(), 'admin', 0.00, 25, 'INV-PRLG915-001', 'admin', 95, 120, NULL, 'prod021'),
('inv022', GETDATE(), 'admin', 0.00, 30, 'INV-PRMSS-001', NULL, 150, 180, GETDATE(), 'prod022'),
('inv023', GETDATE(), 'admin', 0.00, 15, 'INV-PRSWHX5-001', 'admin', 75, 90, NULL, 'prod023'),
('inv024', GETDATE(), 'admin', 0.00, 20, 'INV-PRLBRIO-001', NULL, 90, 110, GETDATE(), 'prod024'),
('inv025', GETDATE(), 'admin', 0.00, 35, 'INV-PRAPEX-001', 'admin', 165, 200, NULL, 'prod025'),

-- Componentes
('inv026', GETDATE(), 'admin', 0.00, 5, 'INV-CPNRTX4090-001', NULL, 25, 30, GETDATE(), 'prod026'),
('inv027', GETDATE(), 'admin', 0.00, 8, 'INV-CPICI9-001', 'admin', 37, 45, NULL, 'prod027'),
('inv028', GETDATE(), 'admin', 0.00, 25, 'INV-CPCV32-001', NULL, 125, 150, GETDATE(), 'prod028'),
('inv029', GETDATE(), 'admin', 0.00, 15, 'INV-CPS980P-001', 'admin', 85, 100, NULL, 'prod029'),
('inv030', GETDATE(), 'admin', 0.00, 5, 'INV-CPARX670-001', NULL, 35, 40, GETDATE(), 'prod030'),

-- Redes
('inv031', GETDATE(), 'admin', 0.00, 15, 'INV-RNTPAX60-001', 'admin', 65, 80, NULL, 'prod031'),
('inv032', GETDATE(), 'admin', 0.00, 20, 'INV-RNNGS308-001', NULL, 100, 120, GETDATE(), 'prod032'),
('inv033', GETDATE(), 'admin', 0.00, 10, 'INV-RNAXG10-001', 'admin', 40, 50, NULL, 'prod033'),
('inv034', GETDATE(), 'admin', 0.00, 15, 'INV-RNDX20-001', NULL, 75, 90, GETDATE(), 'prod034'),
('inv035', GETDATE(), 'admin', 0.00, 10, 'INV-RNMMB86-001', 'admin', 50, 60, NULL, 'prod035'),

-- Impressoras
('inv036', GETDATE(), 'admin', 0.00, 15, 'INV-IPHPOJP-001', NULL, 55, 70, GETDATE(), 'prod036'),
('inv037', GETDATE(), 'admin', 0.00, 10, 'INV-IPBHL235-001', 'admin', 75, 85, NULL, 'prod037'),
('inv038', GETDATE(), 'admin', 0.00, 20, 'INV-IPETMT20-001', NULL, 90, 110, GETDATE(), 'prod038'),
('inv039', GETDATE(), 'admin', 0.00, 3, 'INV-IPCIPF785-001', 'admin', 12, 15, NULL, 'prod039'),
('inv040', GETDATE(), 'admin', 0.00, 8, 'INV-IPZZD420-001', NULL, 42, 50, GETDATE(), 'prod040'),

-- Armazenamento
('inv041', GETDATE(), 'admin', 0.00, 25, 'INV-STWDMP5-001', 'admin', 105, 130, NULL, 'prod041'),
('inv042', GETDATE(), 'admin', 0.00, 15, 'INV-STST71-001', NULL, 80, 95, GETDATE(), 'prod042'),
('inv043', GETDATE(), 'admin', 0.00, 5, 'INV-STSDS920-001', 'admin', 20, 25, NULL, 'prod043'),
('inv044', GETDATE(), 'admin', 0.00, 35, 'INV-STSE256-001', NULL, 165, 200, GETDATE(), 'prod044'),
('inv045', GETDATE(), 'admin', 0.00, 25, 'INV-STSEP512-001', 'admin', 155, 180, NULL, 'prod045'),

-- Acessórios
('inv046', GETDATE(), 'admin', 0.00, 25, 'INV-ACASF-001', NULL, 125, 150, GETDATE(), 'prod046'),
('inv047', GETDATE(), 'admin', 0.00, 15, 'INV-ACRDM-001', 'admin', 75, 90, NULL, 'prod047'),
('inv048', GETDATE(), 'admin', 0.00, 10, 'INV-ACCTSP-001', NULL, 50, 60, GETDATE(), 'prod048');

INSERT INTO [dbo].[receivings] ([id], [created_at], [created_by], [description], [inventory_code], [last_modified_by], [quantity], [receiving_date], [receiving_status], [total_price], [updated_at], [product_id], [supplier_id])
VALUES 
('rec001', GETDATE(), 'admin', 'Recebimento inicial de Galaxy S23', 'INV-SMGS23-003', NULL, 25, '2025-05-14', 'COMPLETED', 124975.00, GETDATE(), 'prod001', 'sup001'),
('rec002', GETDATE(), 'compras', 'Lote de iPhones 15 Pro', 'INV-SMIP15P-002', 'estoque', 18, '2025-05-15', 'COMPLETED', 125982.00, NULL, 'prod002', 'sup003'),
('rec003', GETDATE(), 'financeiro', 'Reposição de Redmi Note 12', 'INV-SMXRN12-003', NULL, 40, '2025-05-16', 'COMPLETED', 75960.00, GETDATE(), 'prod003', 'sup005'),
('rec004', GETDATE(), 'almoxarifado', 'Chegada de Pixel 7 Pro', 'INV-SMPX7P-002', 'qualidade', 12, '2025-05-17', 'PENDING', 51588.00, NULL, 'prod004', 'sup007'),
('rec005', GETDATE(), 'admin', 'Novo lote de Dell XPS 15', 'INV-NBDXPS15-002', NULL, 10, '2025-05-18', 'COMPLETED', 89990.00, GETDATE(), 'prod006', 'sup011'),
('rec006', GETDATE(), 'compras', 'Lote de MacBook Air M2', 'INV-NBMBA2-003', 'estoque', 20, '2025-05-19', 'COMPLETED', 159980.00, NULL, 'prod008', 'sup015'),
('rec007', GETDATE(), 'financeiro', 'Reposição de iPad Pro', 'INV-TBIPPM2-002', NULL, 8, '2025-05-20', 'COMPLETED', 71992.00, GETDATE(), 'prod011', 'sup021'),
('rec008', GETDATE(), 'almoxarifado', 'Chegada de Samsung Tab S8', 'INV-TBSTS8-004', 'qualidade', 15, '2025-05-21', 'PENDING', 64485.00, NULL, 'prod012', 'sup023'),
('rec009', GETDATE(), 'admin', 'Novo lote de LG UltraFine 32"', 'INV-MNLGUF32-003', NULL, 10, '2025-05-22', 'COMPLETED', 32990.00, GETDATE(), 'prod016', 'sup006'),
('rec010', GETDATE(), 'compras', 'Lote de Asus ROG Swift', 'INV-MNAROGS-002', 'estoque', 7, '2025-05-23', 'COMPLETED', 34993.00, NULL, 'prod017', 'sup008'),
('rec011', GETDATE(), 'financeiro', 'Reposição de Logitech G915', 'INV-PRLG915-003', NULL, 30, '2025-05-24', 'COMPLETED', 38970.00, GETDATE(), 'prod021', 'sup016'),
('rec012', GETDATE(), 'almoxarifado', 'Chegada de Microsoft Sculpt', 'INV-PRMSS-004', 'qualidade', 45, '2025-05-25', 'PENDING', 17955.00, NULL, 'prod022', 'sup018'),
('rec013', GETDATE(), 'admin', 'Novo lote de RTX 4090', 'INV-CPNRTX4090-003', NULL, 3, '2025-05-26', 'COMPLETED', 38997.00, GETDATE(), 'prod026', 'sup001'),
('rec014', GETDATE(), 'compras', 'Lote de Intel Core i9', 'INV-CPICI9-002', 'estoque', 10, '2025-05-27', 'COMPLETED', 42990.00, NULL, 'prod027', 'sup003'),
('rec015', GETDATE(), 'financeiro', 'Reposição de TP-Link AX6000', 'INV-RNTPAX60-004', NULL, 20, '2025-05-28', 'COMPLETED', 25980.00, GETDATE(), 'prod031', 'sup011'),
('rec016', GETDATE(), 'almoxarifado', 'Chegada de WD My Passport 5TB', 'INV-STWDMP5-003', 'qualidade', 50, '2025-05-29', 'PENDING', 34950.00, NULL, 'prod041', 'sup006');

INSERT INTO [dbo].[inventory_receivements] ([inventory_id], [receivement_id])
VALUES 
('inv001', 'rec001'),
('inv002', 'rec002'),
('inv003', 'rec003'),
('inv006', 'rec005'),
('inv008', 'rec006'),
('inv011', 'rec007'),
('inv016', 'rec009'),
('inv017', 'rec010'),
('inv021', 'rec011'),
('inv026', 'rec013'),
('inv027', 'rec014'),
('inv031', 'rec015');

INSERT INTO [dbo].[exits] ([id], [created_at], [created_by], [exit_date], [inventory_code], [last_modified_by], [quantity], [exit_status], [updated_at], [product_id])
VALUES 
('exit001', GETDATE(), 'vendas', GETDATE(), 'INV-SMGS23-001', 'faturamento', 3, 'COMPLETED', GETDATE(), 'prod001'),
('exit002', GETDATE(), 'assistencia', GETDATE(),  'INV-SMIP15P-001', NULL, 1, 'COMPLETED', GETDATE(), 'prod002'),
('exit003', GETDATE(), 'vendas', GETDATE(),  'INV-SMXRN12-001', 'entregas', 7, 'RETURNED', GETDATE(), 'prod003'),
('exit004', GETDATE(), 'marketing', GETDATE(), 'INV-SMPX7P-001', NULL, 1,  'COMPLETED', GETDATE(), 'prod004'),
('exit005', GETDATE(), 'vendas', GETDATE(), 'INV-NBDXPS15-001', 'faturamento', 2, 'PENDING', NULL, 'prod006'),
('exit006', GETDATE(), 'devolucao', GETDATE(), 'INV-NBMBA2-001', 'qualidade', 1, 'RETURNED', NULL, 'prod008'),
('exit007', GETDATE(), 'vendas', GETDATE(), 'INV-TBIPPM2-001', 'faturamento', 1, 'COMPLETED', GETDATE(), 'prod011'),
('exit008', GETDATE(), 'assistencia', GETDATE(),  'INV-MNLGUF32-001', NULL, 1, 'COMPLETED', GETDATE(), 'prod016'),
('exit009', GETDATE(), 'vendas', GETDATE(),  'INV-PRLG915-001', 'entregas', 4, 'RETURNED', GETDATE(), 'prod021'),
('exit010', GETDATE(), 'marketing', GETDATE(),  'INV-PRMSS-001', NULL, 2, 'COMPLETED', GETDATE(), 'prod022'),
('exit011', GETDATE(), 'vendas', GETDATE(), 'INV-CPNRTX4090-001', 'faturamento', 1, 'COMPLETED', GETDATE(), 'prod026'),
('exit012', GETDATE(), 'assistencia', GETDATE(), 'INV-CPICI9-001', NULL, 1, 'COMPLETED', GETDATE(), 'prod027'),
('exit013', GETDATE(), 'vendas', GETDATE(),  'INV-RNTPAX60-001', 'entregas', 2, 'COMPLETED', GETDATE(), 'prod031'),
('exit014', GETDATE(), 'marketing', GETDATE(), 'INV-STWDMP5-001', NULL, 1, 'COMPLETED', GETDATE(), 'prod041'),
('exit015', GETDATE(), 'vendas', GETDATE(),  'INV-ACASF-001', 'faturamento', 5, 'COMPLETED', GETDATE(), 'prod046'),
('exit016', GETDATE(), 'assistencia', GETDATE(),  'INV-CPS980P-001', NULL, 1, 'COMPLETED', GETDATE(), 'prod029');

INSERT INTO [dbo].[inventory_exits] ([inventory_id], [exit_id])
VALUES 
('inv001', 'exit001'),
('inv002', 'exit002'),
('inv003', 'exit003'),
('inv004', 'exit004'),
('inv006', 'exit005'),
('inv008', 'exit006'),
('inv011', 'exit007'),
('inv016', 'exit008'),
('inv021', 'exit009'),
('inv022', 'exit010'),
('inv026', 'exit011'),
('inv027', 'exit012'),
('inv031', 'exit013'),
('inv041', 'exit014'),
('inv046', 'exit015'),
('inv029', 'exit016');
