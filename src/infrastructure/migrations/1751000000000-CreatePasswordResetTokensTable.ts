import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePasswordResetTokensTable1751000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "password_reset_tokens" (
                "id" SERIAL PRIMARY KEY,
                "user_id" integer NOT NULL,
                "token" varchar(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "used" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_password_reset_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            );
        `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_user_id" ON "password_reset_tokens" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token" ON "password_reset_tokens" ("token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_password_reset_token"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_password_reset_user_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    }
} 