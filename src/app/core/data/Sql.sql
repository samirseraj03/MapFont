-- Schema actualizado de MapFont (refleja la estructura real en Supabase)
-- Las columnas autencationUserID enlazan cada tabla con auth.users(id)

create table
  Users (
    id bigint primary key generated always as identity,
    location jsonb,
    username text,
    email text,
    name text,
    lastname text,
    number numeric,
    address text,
    photo text,
    password text,
    "autencationUserID" uuid not null,
    language text default 'es',
    created_at timestamp with time zone default now(),
    constraint users_autencationUserID_unique unique ("autencationUserID")
  );

create table
  WaterSources (
    id bigint primary key generated always as identity,
    location jsonb,
    name text,
    address text,
    "isPotable" boolean,
    available boolean,
    created_at timestamp with time zone default now(),
    photo text,
    description text,
    watersourcetype text,
    updated_at timestamp with time zone default now()
  );

create table
  Forms (
    id bigint primary key generated always as identity,
    username text,
    "WaterSourcesName" text,
    created_at timestamp with time zone default now(),
    location jsonb,
    photo text,
    address text,
    description text,
    is_potable boolean,
    "WaterSourceType" text,
    approved boolean,
    "autencationUserID" uuid not null
  );

create table
  UserType (
    id bigint primary key generated always as identity,
    admin_role boolean default false,
    user_role boolean default true,
    "autencationUserID" uuid not null,
    constraint usertype_autencationUserID_unique unique ("autencationUserID")
  );