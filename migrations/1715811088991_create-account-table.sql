-- Up Migration
CREATE TABLE IF NOT EXISTS iam.account (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3),
    deleted_at TIMESTAMP(3),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- Down Migration
DROP TABLE IF EXISTS iam.account;