import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToActionCode1760705660781 implements MigrationInterface {
    name = 'AddCategoryToActionCode1760705660781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_code_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_ee360b1a70679c7a80f2ea5900c" UNIQUE ("companyId", "name"), CONSTRAINT "PK_3d8101df19efed8b6a855ce72d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_codes" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "action_code_categories" ADD CONSTRAINT "FK_54d65c5d66ddf4b50e8b8885375" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_codes" ADD CONSTRAINT "FK_0a207637d7a242bf31b64abc632" FOREIGN KEY ("categoryId") REFERENCES "action_code_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_codes" DROP CONSTRAINT "FK_0a207637d7a242bf31b64abc632"`);
        await queryRunner.query(`ALTER TABLE "action_code_categories" DROP CONSTRAINT "FK_54d65c5d66ddf4b50e8b8885375"`);
        await queryRunner.query(`ALTER TABLE "action_codes" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "action_code_categories"`);
    }

}
