import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || '149.130.168.184',
  user: process.env.DB_USER || 'impuls_user',
  password: process.env.DB_PASSWORD || 'sj%CEDUQ3$k%bfG',
  database: process.env.DB_NAME || 'impulsacol_db',
  port: +(process.env.DB_PORT || 5432),
}); 