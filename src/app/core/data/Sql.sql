-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

create table
  Users (
    id bigint primary key generated always as identity,
    location jsonb,
    username text,
    email text,
    name text,
    lastNname text,
    number numeric,
    address text,
    photo text,
    created_at timestamp with time zone,
    password text
  );

create table
  WaterSources (
    id bigint primary key generated always as identity,
    location jsonb,
    name text,
    address text,
    isPotable boolean,
    available boolean,
    created_at timestamp with time zone,
    photo text,
    description text
  );

create table
  Forms (
    id bigint primary key generated always as identity,
    username text,
    WaterSourcesName text,
    created_at timestamp with time zone,
    location jsonb,
    photo text,
    address text,
    description text,
    is_potable boolean,
    WaterSourceType text,
    approved boolean
  );



create table
  UserType (
    id bigint primary key generated always as identity,
    admin_role boolean,
    user_role boolean
  );