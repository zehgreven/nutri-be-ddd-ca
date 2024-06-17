-- Up Migration
CREATE TABLE IF NOT EXISTS iam.profile_permission (
    id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP(3),
    deleted TIMESTAMP(3),
    allow BOOLEAN NOT NULL DEFAULT false,
    profile_id UUID NOT NULL,
    functionality_id UUID NOT NULL,

    CONSTRAINT profile_permission_pkey PRIMARY KEY (id)
);

ALTER TABLE iam.profile_permission ADD CONSTRAINT profile_permission_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES iam.profile(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE iam.profile_permission ADD CONSTRAINT profile_permission_functionality_id_fkey FOREIGN KEY (functionality_id) REFERENCES iam.functionality(id) ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX profile_permission_unique ON iam.profile_permission(profile_id, functionality_id) WHERE (deleted is null);

-- Down Migration
DROP TABLE IF EXISTS iam.profile_permission;