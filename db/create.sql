drop schema if exists iam cascade;

create schema iam;

create table iam.account (
	id uuid primary key,
	username text not null,
	password text not null
);
