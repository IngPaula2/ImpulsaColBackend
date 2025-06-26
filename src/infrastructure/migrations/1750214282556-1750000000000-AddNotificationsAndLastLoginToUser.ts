import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsAndLastLoginToUser1750214282556 implements MigrationInterface {
    name = 'AddNotificationsAndLastLoginToUser1750214282556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "notifications_enabled" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "last_login" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_7076ecc5ee6a599c9d5bde7bb7a" FOREIGN KEY ("entrepreneurship_id") REFERENCES "entrepreneurships"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "entrepreneurships"
            ADD CONSTRAINT "FK_4df2ea0db01a3a5eae30ee97da2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "investment_ideas"
            ADD CONSTRAINT "FK_5daaf4a978de948fd754c670de6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "investment_ideas" DROP CONSTRAINT "FK_5daaf4a978de948fd754c670de6"
        `);
        await queryRunner.query(`
            ALTER TABLE "entrepreneurships" DROP CONSTRAINT "FK_4df2ea0db01a3a5eae30ee97da2"
        `);
        await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "FK_7076ecc5ee6a599c9d5bde7bb7a"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "last_login"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "notifications_enabled"
        `);
    }

}
