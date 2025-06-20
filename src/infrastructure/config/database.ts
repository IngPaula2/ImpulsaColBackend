import { DataSource } from 'typeorm';
import { UserEntity } from '../persistence/entities/UserEntity';
import { EntrepreneurshipEntity } from '../persistence/entities/EntrepreneurshipEntity';
import { ProductEntity } from '../persistence/entities/ProductEntity';
import { InvestmentIdeaEntity } from '../persistence/entities/InvestmentIdeaEntity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'impulsacol',
    entities: [
        UserEntity,
        EntrepreneurshipEntity,
        ProductEntity,
        InvestmentIdeaEntity
    ],
    synchronize: false, // Cambiado a false para prevenir pérdida de datos
    logging: true,
    migrations: ['src/infrastructure/migrations/*.ts'],
    migrationsRun: true // Ejecutará las migraciones al iniciar
}); 