import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/User';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [UserEntity],
    synchronize: false, // Cambiado a false para prevenir pérdida de datos
    logging: true,
    migrations: ['src/infrastructure/migrations/*.ts'],
    migrationsRun: true // Ejecutará las migraciones al iniciar
}); 