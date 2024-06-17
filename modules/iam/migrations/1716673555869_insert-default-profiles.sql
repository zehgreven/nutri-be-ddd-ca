-- Up Migration
INSERT INTO iam.profile (id, active, created, updated, deleted, name, description) VALUES 
('a81b2f88-fe8f-492c-aca5-7b09983c007d', true, '2022-08-27 00:00:00.00', NULL, NULL, 'Admin', 'Perfil de administrador do sistema'),
('86027778-079a-4a51-b378-268fcc7fe19a', true, '2022-08-27 00:00:00.00', NULL, NULL, 'Nutri', 'Perfil de nutricionista'),
('dc10c0f0-d45a-45ae-9b75-d1ebfe8b4131', true, '2022-08-27 00:00:00.00', NULL, NULL, 'Cliente', 'Perfil de cliente');

-- Down Migration
delete from iam.profile where id in (
  'a81b2f88-fe8f-492c-aca5-7b09983c007d',
  '86027778-079a-4a51-b378-268fcc7fe19a',
  'dc10c0f0-d45a-45ae-9b75-d1ebfe8b4131'
)