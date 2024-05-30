-- Up Migration
CREATE TABLE iam.profile (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX profile_name_unique ON iam.profile (name) WHERE (deleted is null);


-- Down Migration
DROP TABLE IF EXISTS iam.profile;