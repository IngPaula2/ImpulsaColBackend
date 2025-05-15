// src/infrastructure/repositories/UserRepositoryPostgres.ts
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import pool from '../database/connection';

export class UserRepositoryPostgres implements UserRepository {

    async create(user: User): Promise<User> {
        const result = await pool.query(
            `INSERT INTO usuario (nombre, email, contraseña, rol, fecharegistro, estado)
            VALUES ($1, $2, $3, $4, NOW(), $5)
            RETURNING userid, nombre, email, contraseña, rol, fecharegistro, estado`,
            [user.name, user.email, user.password, user.role || 'user', user.status || 'active']
        );
        const row = result.rows[0];
        return {
            id: row.userid,
            name: row.nombre,
            email: row.email,
            password: row.contraseña,
            role: row.rol,
            registrationDate: row.fecharegistro,
            status: row.estado,
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT userid, nombre, email, contraseña, rol, fecharegistro, estado
            FROM usuario WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            id: row.userid,
            name: row.nombre,
            email: row.email,
            password: row.contraseña,
            role: row.rol,
            registrationDate: row.fecharegistro,
            status: row.estado,
        };
    }
}
