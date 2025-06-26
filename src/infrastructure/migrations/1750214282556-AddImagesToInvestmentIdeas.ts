import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagesToInvestmentIdeas1750214282556 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" ADD COLUMN "images" text[] NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" DROP COLUMN "images"`
        );
    }
} 