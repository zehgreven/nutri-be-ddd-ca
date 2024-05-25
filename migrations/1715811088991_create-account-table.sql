-- Up Migration
CREATE TABLE IF NOT EXISTS iam.account (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- Down Migration
DROP TABLE IF EXISTS iam.account;