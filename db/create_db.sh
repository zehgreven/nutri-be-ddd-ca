#!/bin/sh

docker exec -it nutri-be-ddd-ca_database_1 psql -v ON_ERROR_STOP=1 -U postgres -d app -f /var/lib/postgresql/create.sql

exit