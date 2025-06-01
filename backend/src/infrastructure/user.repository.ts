import { pool } from '../config/db';
import { User } from '../domain/user.entity';

export class UserRepository {
  async create(user: User): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, document_type, document_number, phone, address, city, department, country, birth_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        user.full_name,
        user.email,
        user.password_hash,
        user.document_type,
        user.document_number,
        user.phone,
        user.address,
        user.city,
        user.department,
        user.country,
        user.birth_date,
      ]
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }
} 