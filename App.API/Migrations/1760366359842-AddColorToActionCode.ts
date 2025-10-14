import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToActionCode1760366359842 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_codes" ADD "color" character varying(7) NOT NULL DEFAULT '#000000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "action_codes" DROP COLUMN "color"`);
  }
}
