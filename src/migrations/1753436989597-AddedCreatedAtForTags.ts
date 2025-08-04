import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedCreatedAtForTags1753436989597 implements MigrationInterface {
  name = 'AddedCreatedAtForTags1753436989597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "created_at"`);
  }
}
