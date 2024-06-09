-- Up Migration
CREATE TABLE IF NOT EXISTS iam.account (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT false,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    username TEXT NOT NULL,
    password TEXT NOT NULL,

    CONSTRAINT account_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX account_username_unique ON iam.account (username) WHERE (deleted is null);

-- Down Migration
DROP TABLE IF EXISTS iam.account;