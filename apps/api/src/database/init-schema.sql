-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE campaigns_status_enum AS ENUM ('pending', 'collecting', 'matching', 'analyzing', 'complete', 'error');
CREATE TYPE campaigns_campaigntype_enum AS ENUM ('acquisition', 'winback', 'retention', 'seasonal');
CREATE TYPE campaigns_priority_enum AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE match_records_customertype_enum AS ENUM ('NEW_SIGNUP', 'NEW_VISITOR', 'WINBACK', 'EXISTING');
CREATE TYPE users_role_enum AS ENUM ('admin', 'user');

-- Create campaigns table
CREATE TABLE campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  "billingNumber" character varying(100) NOT NULL,
  status campaigns_status_enum NOT NULL DEFAULT 'pending',
  "dropDate" date NOT NULL,
  "redropDate" date,
  markets jsonb NOT NULL,
  "emailEndpoint" character varying(255) NOT NULL,
  "campaignType" campaigns_campaigntype_enum NOT NULL,
  priority campaigns_priority_enum NOT NULL DEFAULT 'normal',
  "expectedRecords" integer,
  "vendorEmail" character varying(255) NOT NULL,
  notes text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_831e3fcd94a971c7ce7a6cd5657" PRIMARY KEY (id),
  CONSTRAINT "UQ_c5d85abe01fe2a7de033fa19106" UNIQUE ("billingNumber"),
  CONSTRAINT "UQ_e2e11bd5c8c37e6f1f28cd3e1e7" UNIQUE ("emailEndpoint")
);

-- Create match_records table
CREATE TABLE match_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "dcmId" character varying(255) NOT NULL,
  "customerId" character varying(255) NOT NULL,
  "emailAddress" character varying(255),
  "signupDate" date NOT NULL,
  "totalVisits" integer NOT NULL DEFAULT 0,
  "visit1Date" date,
  matched boolean NOT NULL DEFAULT false,
  "inPattern" boolean,
  "patternOverride" character varying(255),
  "customerType" match_records_customertype_enum,
  "totalSales" numeric(10,2),
  "campaignId" uuid NOT NULL,
  market character varying(100) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_ed104f0de4f7c74a4926745188c" PRIMARY KEY (id),
  CONSTRAINT "UQ_5e42d82b9206b48a36579c231de" UNIQUE ("dcmId"),
  CONSTRAINT "FK_a5a6c5bd7abbd7d0f726f99ca77" FOREIGN KEY ("campaignId") REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying(255) NOT NULL,
  name character varying(255),
  role users_role_enum NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
  CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
);

-- Create indexes for match_records
CREATE INDEX "IDX_5e42d82b9206b48a36579c231d" ON match_records ("dcmId");
CREATE INDEX "IDX_110a4e7cab6060745fe9a41478" ON match_records ("customerId");
CREATE INDEX "IDX_2e68235479c93f2489b7561b12" ON match_records ("emailAddress");
CREATE INDEX "IDX_a5a6c5bd7abbd7d0f726f99ca7" ON match_records ("campaignId");
