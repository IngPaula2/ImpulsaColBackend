import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntrepreneurshipAndProductTables1749957785822 implements MigrationInterface {
    name = 'CreateEntrepreneurshipAndProductTables1749957785822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero actualizamos los registros existentes
        await queryRunner.query(`UPDATE "users" SET "email" = 'default@example.com' WHERE "email" IS NULL`);
        await queryRunner.query(`UPDATE "users" SET "password_hash" = 'default_hash' WHERE "password_hash" IS NULL`);
        await queryRunner.query(`UPDATE "users" SET "full_name" = 'Default User' WHERE "full_name" IS NULL`);
        
        // Ahora podemos hacer los campos NOT NULL
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL`);
        
        // El resto de la migración...
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "products_entrepreneurship_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" DROP CONSTRAINT "entrepreneurships_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP CONSTRAINT "investment_ideas_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "images" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "wants_investor" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "products" ADD "investment_value" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "investor_message" text`);
        await queryRunner.query(`ALTER TABLE "products" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD "entrepreneurshipId" integer`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ADD "category" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ADD "cover_image" character varying`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD "category" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD "investors_needed" integer`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD "investor_message" text`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "document_type"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "document_type" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "document_number"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "document_number" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "department" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "birth_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "products_id_seq" OWNED BY "products"."id"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT nextval('"products_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "entrepreneurship_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "entrepreneurships_id_seq" OWNED BY "entrepreneurships"."id"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "id" SET DEFAULT nextval('"entrepreneurships_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "investment_ideas_id_seq" OWNED BY "investment_ideas"."id"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "id" SET DEFAULT nextval('"investment_ideas_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1c63e28765fccc09080ff6f6172" FOREIGN KEY ("entrepreneurshipId") REFERENCES "entrepreneurships"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ADD CONSTRAINT "FK_622d3c79d86222b65c090998726" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD CONSTRAINT "FK_fd7debc4dce2d7196a1f59f1ff1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP CONSTRAINT "FK_fd7debc4dce2d7196a1f59f1ff1"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" DROP CONSTRAINT "FK_622d3c79d86222b65c090998726"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1c63e28765fccc09080ff6f6172"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "id" SET DEFAULT nextval('investment_ideas_id_seq1')`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "investment_ideas_id_seq"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "id" SET DEFAULT nextval('entrepreneurships_id_seq1')`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "entrepreneurships_id_seq"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "entrepreneurship_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT nextval('products_id_seq1')`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "products_id_seq"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "birth_date" date`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "country" text DEFAULT 'Colombia'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "department" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "city" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "document_number"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "document_number" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "document_type"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "document_type" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "full_name" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" text`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP COLUMN "investor_message"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP COLUMN "investors_needed"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" DROP COLUMN "cover_image"`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "entrepreneurshipId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "investor_message"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "investment_value"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "wants_investor"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "investment_ideas" ADD CONSTRAINT "investment_ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "entrepreneurships" ADD CONSTRAINT "entrepreneurships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "products_entrepreneurship_id_fkey" FOREIGN KEY ("entrepreneurship_id") REFERENCES "entrepreneurships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
