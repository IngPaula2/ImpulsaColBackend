import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1750300000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1750300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'message',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'data',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'is_read',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'read_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                indices: [
                    {
                        name: 'IDX_notifications_user_id',
                        columnNames: ['user_id']
                    },
                    {
                        name: 'IDX_notifications_user_id_is_read',
                        columnNames: ['user_id', 'is_read']
                    },
                    {
                        name: 'IDX_notifications_type',
                        columnNames: ['type']
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notifications');
    }
} 