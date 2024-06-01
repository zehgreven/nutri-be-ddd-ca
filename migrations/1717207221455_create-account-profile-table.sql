-- Up Migration
CREATE TABLE iam.account_profile (
    id UUID NOT NULL,
    account_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    created TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted TIMESTAMP(3),

    CONSTRAINT account_profile_pkey PRIMARY KEY (id),
    CONSTRAINT account_profile_account_id_fkey FOREIGN KEY (account_id) REFERENCES iam.account(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT account_profile_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES iam.profile(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX account_profile_account_id_profile_id_unique ON iam.account_profile(account_id, profile_id);
CREATE INDEX account_profile_account_id_index ON iam.account_profile(account_id);
CREATE INDEX account_profile_profile_id_index ON iam.account_profile(profile_id);

-- Down Migration
ALTER TABLE iam.account_profile DROP CONSTRAINT account_profile_profile_id_fkey;
ALTER TABLE iam.account_profile DROP CONSTRAINT account_profile_account_id_fkey;
DROP TABLE iam.account_profile;