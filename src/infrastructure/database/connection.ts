// src/infrastructure/database/connection.ts
import { Pool } from 'pg';

const pool = new Pool({
    user: 'impuls_user',
    host: '149.130.168.184',
    database: 'impulsacol_db',
    password: 'sj%CEDUQ3$k%bfG',
    port: 5432,
});

export default pool;
