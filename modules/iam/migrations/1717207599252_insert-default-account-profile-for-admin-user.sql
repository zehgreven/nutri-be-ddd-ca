-- Up Migration
insert into iam.account_profile (id, account_id, profile_id) 
values ('0918faca-bba4-4aaf-bf42-909dcc136830', '13782202-684d-4ba9-9cad-487b9e4a6a8a', 'a81b2f88-fe8f-492c-aca5-7b09983c007d')

-- Down Migration
delete from iam.account_profile where id = '0918faca-bba4-4aaf-bf42-909dcc136830'