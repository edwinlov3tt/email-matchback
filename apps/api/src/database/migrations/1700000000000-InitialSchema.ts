import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create campaigns table
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "billingNumber" varchar(100) NOT NULL,
        "dropDate" date NOT NULL,
        "redropDate" date,
        "markets" text NOT NULL,
        "emailEndpoint" varchar(255) NOT NULL UNIQUE,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "campaignType" varchar(20) NOT NULL DEFAULT 'acquisition',
        "priority" varchar(20) NOT NULL DEFAULT 'normal',
        "expectedRecords" int,
        "vendorEmail" varchar(255) NOT NULL,
        "notes" text,
        "metrics" jsonb,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "name" varchar(255),
        "role" varchar(20) NOT NULL DEFAULT 'client_viewer',
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create match_records table
    await queryRunner.query(`
      CREATE TABLE "match_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "dcmId" varchar(255) NOT NULL UNIQUE,
        "customerId" varchar(255) NOT NULL,
        "emailAddress" varchar(255),
        "signupDate" date NOT NULL,
        "totalVisits" int NOT NULL DEFAULT 0,
        "visit1Date" date,
        "matched" boolean NOT NULL DEFAULT false,
        "inPattern" boolean,
        "patternOverride" varchar(255),
        "customerType" varchar(20),
        "totalSales" decimal(10,2),
        "campaignId" uuid NOT NULL,
        "market" varchar(100) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_match_records_dcmId" ON "match_records" ("dcmId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_match_records_customerId" ON "match_records" ("customerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_match_records_emailAddress" ON "match_records" ("emailAddress")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_match_records_campaignId" ON "match_records" ("campaignId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "IDX_match_records_campaignId"`);
    await queryRunner.query(`DROP INDEX "IDX_match_records_emailAddress"`);
    await queryRunner.query(`DROP INDEX "IDX_match_records_customerId"`);
    await queryRunner.query(`DROP INDEX "IDX_match_records_dcmId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "match_records"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
