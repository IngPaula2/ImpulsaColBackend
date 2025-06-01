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
                        name: "full_name",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "email",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "password_hash",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "document_type",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "document_number",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "phone",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "address",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "city",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "department",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "country",
                        type: "text",
                        isNullable: true,
                        default: "'Colombia'"
                    },
                    {
                        name: "birth_date",
                        type: "date",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        isNullable: true,
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