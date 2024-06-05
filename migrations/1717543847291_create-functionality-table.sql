-- Up Migration
CREATE TABLE IF NOT EXISTS iam.functionality (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    description TEXT,
    name TEXT NOT NULL,
    path TEXT,
    icon TEXT,
    functionality_type_id UUID NOT NULL,
    master_id UUID,

    CONSTRAINT functionality_pkey PRIMARY KEY (id)
);
ALTER TABLE iam.functionality ADD CONSTRAINT functionality_functionality_type_id_fkey FOREIGN KEY (functionality_type_id) REFERENCES iam.functionality_type(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE iam.functionality ADD CONSTRAINT functionality_master_id_fkey FOREIGN KEY (master_id) REFERENCES iam.functionality(id) ON DELETE SET NULL ON UPDATE CASCADE;


-- Down Migration
DROP TABLE IF EXISTS iam.functionality;