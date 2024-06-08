-- Up Migration
CREATE TABLE IF NOT EXISTS iam.account_permission (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    allow BOOLEAN NOT NULL DEFAULT false,
    account_id UUID NOT NULL,
    functionality_id UUID NOT NULL,

    CONSTRAINT account_permission_pkey PRIMARY KEY (id)
);

ALTER TABLE iam.account_permission ADD CONSTRAINT account_permission_account_id_fkey FOREIGN KEY (account_id) REFERENCES iam.account(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE iam.account_permission ADD CONSTRAINT account_permission_functionality_id_fkey FOREIGN KEY (functionality_id) REFERENCES iam.functionality(id) ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX account_permission_unique ON iam.account_permission(account_id, functionality_id) WHERE (deleted is null);

-- Down Migration
DROP TABLE IF EXISTS iam.account_permission;