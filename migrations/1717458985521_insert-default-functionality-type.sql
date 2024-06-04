-- Up Migration
insert into iam.functionality_type (id, active, created, updated, deleted, name, description) VALUES 
('52a19d20-9904-4a2d-b7c5-ff3d25b80e41', true, '2022-08-27 00:00:00.00', NULL, NULL, 'Tela do Menu Lateral', 'Telas que devem aparecer no menu lateral'),
('60d398d2-7f37-4728-8ebe-8d23871bbe31', true, '2022-08-27 00:00:00.00', NULL, NULL, 'Tela', 'Telas que não devem aparecer no menu lateral');

-- Down Migration
delete from iam.functionality_type where id in (
  '52a19d20-9904-4a2d-b7c5-ff3d25b80e41',
  '60d398d2-7f37-4728-8ebe-8d23871bbe31'
)