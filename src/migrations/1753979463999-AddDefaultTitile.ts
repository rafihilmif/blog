import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultTitile1753979463999 implements MigrationInterface {
    name = 'AddDefaultTitile1753979463999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "title" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "title" DROP DEFAULT`);
    }

}
