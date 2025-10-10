import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimesheetEntryExclusionConstraint1760097251609 implements MigrationInterface {
    name = 'AddTimesheetEntryExclusionConstraint1760097251609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_90a7fa055770723414527fdb7b1"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_16c9f12b110e489d605277e0fa7"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_cb39665997af2b6545d21d1b84f"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP COLUMN "at"`);
        await queryRunner.query(`ALTER TABLE "team" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD "orgId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD "organizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "action_code" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "approval" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD "orgId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "active_session" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD "orgId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval" ALTER COLUMN "entryId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval" ALTER COLUMN "approverId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "actorUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "diff" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_8b7b8984a39c096efcefee72bf" ON "approval" ("entryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_352ac8df5473da43192b3f09da" ON "timesheet_entry" ("orgId", "userId", "day") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3a9d2038eafa6c7cfe9e40853" ON "audit_log" ("entity", "entityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a49b489feac17255c58e140ab" ON "audit_log" ("orgId") `);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "CHK_39e351faff81984d1f3d811a40" CHECK ("durationMin" >= 0)`);
        await queryRunner.query(`ALTER TABLE "team_member" ADD CONSTRAINT "FK_23c29c0ee6097d3f27c4034ef3a" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0" FOREIGN KEY ("entryId") REFERENCES "timesheet_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_90a7fa055770723414527fdb7b1" FOREIGN KEY ("approverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_16c9f12b110e489d605277e0fa7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_ef993cdeb41f121695dd56fb80d" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_ef993cdeb41f121695dd56fb80d"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "FK_16c9f12b110e489d605277e0fa7"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_90a7fa055770723414527fdb7b1"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP CONSTRAINT "FK_23c29c0ee6097d3f27c4034ef3a"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP CONSTRAINT "CHK_39e351faff81984d1f3d811a40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a49b489feac17255c58e140ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3a9d2038eafa6c7cfe9e40853"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_352ac8df5473da43192b3f09da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b7b8984a39c096efcefee72bf"`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "diff" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_log" ALTER COLUMN "actorUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval" ALTER COLUMN "approverId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "approval" ALTER COLUMN "entryId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP COLUMN "orgId"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "active_session" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP COLUMN "orgId"`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "approval" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "action_code" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "team_member" DROP COLUMN "orgId"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD "at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD "organizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_36279d1f26f4a280fa4fa4eb3af" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_b2a2e69f0abb8e3c1293fea2552" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_cb39665997af2b6545d21d1b84f" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "timesheet_entry" ADD CONSTRAINT "FK_16c9f12b110e489d605277e0fa7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_90a7fa055770723414527fdb7b1" FOREIGN KEY ("approverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "approval" ADD CONSTRAINT "FK_8b7b8984a39c096efcefee72bf0" FOREIGN KEY ("entryId") REFERENCES "timesheet_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
