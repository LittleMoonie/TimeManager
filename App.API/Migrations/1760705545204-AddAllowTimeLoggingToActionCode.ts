import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllowTimeLoggingToActionCode1760705545204 implements MigrationInterface {
    name = 'AddAllowTimeLoggingToActionCode1760705545204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_codes" ADD "allowTimeLogging" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_codes" DROP COLUMN "allowTimeLogging"`);
    }

}
