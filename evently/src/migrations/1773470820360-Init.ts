import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1773470820360 implements MigrationInterface {
    name = 'Init1773470820360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booking" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "tierId" integer)`);
        await queryRunner.query(`CREATE TABLE "tier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "price" decimal(10,2) NOT NULL, "totalCapacity" integer NOT NULL, "availableSeats" integer NOT NULL, "eventId" integer)`);
        await queryRunner.query(`CREATE TABLE "event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "description" varchar NOT NULL, "venue" varchar NOT NULL, "city" varchar NOT NULL, "startDate" datetime NOT NULL, "endDate" datetime NOT NULL, "status" varchar NOT NULL DEFAULT ('draft'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "organizerId" integer)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_booking" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "tierId" integer, CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_641f805db21284d9746cc6dd72d" FOREIGN KEY ("tierId") REFERENCES "tier" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_booking"("id", "quantity", "status", "createdAt", "userId", "tierId") SELECT "id", "quantity", "status", "createdAt", "userId", "tierId" FROM "booking"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`ALTER TABLE "temporary_booking" RENAME TO "booking"`);
        await queryRunner.query(`CREATE TABLE "temporary_tier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "price" decimal(10,2) NOT NULL, "totalCapacity" integer NOT NULL, "availableSeats" integer NOT NULL, "eventId" integer, CONSTRAINT "FK_71f2f5195c11b8b89f9c116c213" FOREIGN KEY ("eventId") REFERENCES "event" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tier"("id", "name", "price", "totalCapacity", "availableSeats", "eventId") SELECT "id", "name", "price", "totalCapacity", "availableSeats", "eventId" FROM "tier"`);
        await queryRunner.query(`DROP TABLE "tier"`);
        await queryRunner.query(`ALTER TABLE "temporary_tier" RENAME TO "tier"`);
        await queryRunner.query(`CREATE TABLE "temporary_event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "description" varchar NOT NULL, "venue" varchar NOT NULL, "city" varchar NOT NULL, "startDate" datetime NOT NULL, "endDate" datetime NOT NULL, "status" varchar NOT NULL DEFAULT ('draft'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "organizerId" integer, CONSTRAINT "FK_19642e6a244b4885e14eab0fdc0" FOREIGN KEY ("organizerId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_event"("id", "title", "description", "venue", "city", "startDate", "endDate", "status", "createdAt", "organizerId") SELECT "id", "title", "description", "venue", "city", "startDate", "endDate", "status", "createdAt", "organizerId" FROM "event"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`ALTER TABLE "temporary_event" RENAME TO "event"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" RENAME TO "temporary_event"`);
        await queryRunner.query(`CREATE TABLE "event" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "description" varchar NOT NULL, "venue" varchar NOT NULL, "city" varchar NOT NULL, "startDate" datetime NOT NULL, "endDate" datetime NOT NULL, "status" varchar NOT NULL DEFAULT ('draft'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "organizerId" integer)`);
        await queryRunner.query(`INSERT INTO "event"("id", "title", "description", "venue", "city", "startDate", "endDate", "status", "createdAt", "organizerId") SELECT "id", "title", "description", "venue", "city", "startDate", "endDate", "status", "createdAt", "organizerId" FROM "temporary_event"`);
        await queryRunner.query(`DROP TABLE "temporary_event"`);
        await queryRunner.query(`ALTER TABLE "tier" RENAME TO "temporary_tier"`);
        await queryRunner.query(`CREATE TABLE "tier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "price" decimal(10,2) NOT NULL, "totalCapacity" integer NOT NULL, "availableSeats" integer NOT NULL, "eventId" integer)`);
        await queryRunner.query(`INSERT INTO "tier"("id", "name", "price", "totalCapacity", "availableSeats", "eventId") SELECT "id", "name", "price", "totalCapacity", "availableSeats", "eventId" FROM "temporary_tier"`);
        await queryRunner.query(`DROP TABLE "temporary_tier"`);
        await queryRunner.query(`ALTER TABLE "booking" RENAME TO "temporary_booking"`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "status" varchar NOT NULL DEFAULT ('active'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "tierId" integer)`);
        await queryRunner.query(`INSERT INTO "booking"("id", "quantity", "status", "createdAt", "userId", "tierId") SELECT "id", "quantity", "status", "createdAt", "userId", "tierId" FROM "temporary_booking"`);
        await queryRunner.query(`DROP TABLE "temporary_booking"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "tier"`);
        await queryRunner.query(`DROP TABLE "booking"`);
    }

}
