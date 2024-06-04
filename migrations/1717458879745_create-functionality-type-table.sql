-- Up Migration
CREATE TABLE IF NOT EXISTS iam.functionality_type (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    description TEXT,
    name TEXT NOT NULL,

    CONSTRAINT functionality_type_pkey PRIMARY KEY (id)
);


CREATE UNIQUE INDEX functionality_type_name_unique ON iam.functionality_type (name) WHERE (deleted is null);

-- Down Migration
DROP TABLE IF EXISTS iam.functionality_type;