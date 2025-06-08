import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1710123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false
                    },
                    {
                        name: "password_hash",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "full_name",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "document_type",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "document_number",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "address",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "city",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "department",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "country",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "birth_date",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
} 