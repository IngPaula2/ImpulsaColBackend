import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoAndEntrepreneurshipToInvestmentIdeas1750214282557 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna para estado activo
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" ADD COLUMN "is_active" boolean NOT NULL DEFAULT false`
        );

        // Agregar la llave foránea
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" ADD CONSTRAINT "FK_investment_ideas_entrepreneurship" 
             FOREIGN KEY ("entrepreneurship_id") REFERENCES "entrepreneurships"("id") 
             ON DELETE SET NULL ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la llave foránea
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" DROP CONSTRAINT "FK_investment_ideas_entrepreneurship"`
        );

        // Eliminar la columna is_active
        await queryRunner.query(
            `ALTER TABLE "investment_ideas" DROP COLUMN "is_active"`
        );
    }
} 