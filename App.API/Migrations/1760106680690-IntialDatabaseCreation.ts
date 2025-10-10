import { MigrationInterface, QueryRunner } from "typeorm";

export class IntialDatabaseCreation1760106680690 implements MigrationInterface {
    name = 'IntialDatabaseCreation1760106680690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "organizationId" uuid, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_member" ("userId" uuid NOT NULL, "teamId" uuid NOT NULL, "orgId" uuid NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'member', "organizationId" uuid, CONSTRAINT "PK_bd2b3ef7569d75642e091853771" PRIMARY KEY ("userId", "teamId"))`);
        await queryRunner.query(`CREATE TYPE "public"."action_code_type_enum" AS ENUM('billable', 'non-billable')`);
        await queryRunner.query(`CREATE TABLE "action_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "type" "public"."action_code_type_enum" NOT NULL DEFAULT 'billable', "active" boolean NOT NULL DEFAULT true, "organizationId" uuid, CONSTRAINT "UQ_22b8cc0cf74bd2f4f5073ec9348" UNIQUE ("organizationId", "code"), CONSTRAINT "PK_2331c47a78c68fa2090334cccf3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."approval_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "approval" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "entryId" uuid NOT NULL, "approverId" uuid NOT NULL, "status" "public"."approval_status_enum" NOT NULL DEFAULT 'pending', "reason" text, CONSTRAINT "PK_97bfd1cd9dff3c1302229da6b5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b7b8984a39c096efcefee72bf" ON "approval" ("entryId") `);
        await queryRunner.query(`CREATE TYPE "public"."timesheet_entry_workmode_enum" AS ENUM('office', 'remote', 'hybrid')`);
        await queryRunner.query(`CREATE TABLE "timesheet_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "orgId" uuid NOT NULL, "workMode" "public"."timesheet_entry_workmode_enum" NOT NULL DEFAULT 'office', "country" character varying(2) NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE, "endedAt" TIMESTAMP WITH TIME ZONE, "durationMin" integer NOT NULL, "note" text, "day" date NOT NULL, "actionCodeId" uuid, CONSTRAINT "CHK_39e351faff81984d1f3d811a40" CHECK ("durationMin" >= 0), CONSTRAINT "CHK_e9261024f596219894224d6b9a" CHECK ("durationMin" <= 1440), CONSTRAINT "PK_d15eefb424abaf5b3e40ee84fc2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_352ac8df5473da43192b3f09da" ON "timesheet_entry" ("orgId", "userId", "day") `);
        await queryRunner.query(`CREATE TYPE "public"."timesheet_history_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "timesheet_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "weekStart" date NOT NULL, "weekEnd" date NOT NULL, "totalHours" numeric(6,2) NOT NULL DEFAULT '0', "country" character varying(2) NOT NULL, "location" character varying(32) NOT NULL, "notes" text, "status" "public"."timesheet_history_status_enum" NOT NULL DEFAULT 'DRAFT', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "hash" character varying(255), "organizationId" uuid, CONSTRAINT "PK_c1b6dc9f3965a4f70f1b7cbe0fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae67d2abdfa454aea75714f93a" ON "timesheet_history" ("userId") `);
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orgId" uuid NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(50) NOT NULL, "status" "public"."user_status_enum" NOT NULL, "organizationId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "active_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "token" text NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_f14ab8ee60757c7fdd3bae02318" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_log_action_enum" AS ENUM('create', 'update', 'delete')`);
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "actorUserId" uuid NOT NULL, "orgId" uuid NOT NULL, "entity" character varying(255) NOT NULL, "entityId" uuid NOT NULL, "action" "public"."audit_log_action_enum" NOT NULL, "diff" jsonb, "organizationId" uuid, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e3a9d2038eafa6c7cfe9e40853" ON "audit_log" ("entity", "entityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a49b489feac17255c58e140ab" ON "audit_log" ("orgId") `);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_12e10686074dba7e8fd02f41bf4" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_74da8f612921485e1005dc8e225" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_23c29c0ee6097d3f27c4034ef3a" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_code" ADD CONSTRAINT "FK_f22dcea605934d5865675e9fcf8" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0" FOREIGN KEY ("entryId") REFERENCES "timesheet_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_90a7fa055770723414527fdb7b1" FOREIGN KEY ("approverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_16c9f12b110e489d605277e0fa7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_ef993cdeb41f121695dd56fb80d" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_dc1fde29b69f7393b4c7b10bb81" FOREIGN KEY ("actionCodeId") REFERENCES "action_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_history" ADD CONSTRAINT "FK_bc310d8c18061f10fc2db80745c" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_dfda472c0af7812401e592b6a61" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_session" ADD CONSTRAINT "FK_02026b724417d722e48f996744c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552"`);
        await queryRunner.query(`ALTER TABLE "active_session" DROP CONSTRAINT "FK_02026b724417d722e48f996744c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_dfda472c0af7812401e592b6a61"`);
        await queryRunner.query(`ALTER TABLE "timesheet_history" DROP CONSTRAINT "FK_bc310d8c18061f10fc2db80745c"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_dc1fde29b69f7393b4c7b10bb81"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_ef993cdeb41f121695dd56fb80d"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_16c9f12b110e489d605277e0fa7"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_90a7fa055770723414527fdb7b1"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0"`);
        await queryRunner.query(`ALTER TABLE "action_code" DROP CONSTRAINT "FK_f22dcea605934d5865675e9fcf8"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_23c29c0ee6097d3f27c4034ef3a"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_74da8f612921485e1005dc8e225"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_d2be3e8fc9ab0f69673721c7fc3"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_12e10686074dba7e8fd02f41bf4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a49b489feac17255c58e140ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3a9d2038eafa6c7cfe9e40853"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TYPE "public"."audit_log_action_enum"`);
        await queryRunner.query(`DROP TABLE "active_session"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae67d2abdfa454aea75714f93a"`);
        await queryRunner.query(`DROP TABLE "timesheet_history"`);
        await queryRunner.query(`DROP TYPE "public"."timesheet_history_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_352ac8df5473da43192b3f09da"`);
        await queryRunner.query(`DROP TABLE "timesheet_entry"`);
        await queryRunner.query(`DROP TYPE "public"."timesheet_entry_workmode_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b7b8984a39c096efcefee72bf"`);
        await queryRunner.query(`DROP TABLE "approval"`);
        await queryRunner.query(`DROP TYPE "public"."approval_status_enum"`);
        await queryRunner.query(`DROP TABLE "action_code"`);
        await queryRunner.query(`DROP TYPE "public"."action_code_type_enum"`);
        await queryRunner.query(`DROP TABLE "team_member"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
