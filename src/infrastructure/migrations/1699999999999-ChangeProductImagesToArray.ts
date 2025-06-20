import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeProductImagesToArray1699999999999 implements MigrationInterface {
    name = 'ChangeProductImagesToArray1699999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Convierte todos los valores a arrays de un solo elemento en formato Postgres
        await queryRunner.query(`
            UPDATE "products"
            SET "images" = '{' || REPLACE("images", '"', '\"') || '}'
            WHERE "images" IS NOT NULL
        `);

        // Cambia el tipo de la columna a text[]
        await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "images" TYPE text[]
            USING "images"::text[]
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Vuelve a string plano (toma solo la primera imagen del array)
        await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "images" TYPE character varying
            USING
                CASE
                    WHEN "images" IS NULL THEN NULL
                    ELSE "images"[1]
                END
        `);
    }
} 