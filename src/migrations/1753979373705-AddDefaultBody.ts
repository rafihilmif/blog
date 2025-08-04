import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultBody1753979373705 implements MigrationInterface {
    name = 'AddDefaultBody1753979373705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "body" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "body" DROP DEFAULT`);
    }

}
