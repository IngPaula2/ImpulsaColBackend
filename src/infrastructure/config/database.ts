import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/entities/UserEntity';
import { CreateUserTable1710123456789 } from '../migrations/1710123456789-CreateUserTable';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'impulsacol',
    entities: [UserEntity],
    synchronize: false, // Cambiado a false para prevenir pérdida de datos
    logging: true,
    migrations: [CreateUserTable1710123456789],
    migrationsRun: true // Ejecutará las migraciones al iniciar
}); 