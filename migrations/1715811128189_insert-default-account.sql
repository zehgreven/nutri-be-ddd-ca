-- Up Migration
INSERT INTO iam.account (id, active, created_at, updated_at, deleted_at, password, username) VALUES ('13782202-684d-4ba9-9cad-487b9e4a6a8a', true, '2022-08-27 00:00:00.00', NULL, NULL, '$2b$08$TU3IsDnDfJigCgzut8WBbuu1Faf.COqwI7f2DDiFoZLS2ZAbuWIZW', 'admin@nutri.com');

-- Down Migration
DELETE FROM iam.account WHERE id = '13782202-684d-4ba9-9cad-487b9e4a6a8a'