import express from 'express';
import pool from './infrastructure/database/connection';

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
    res.send('¡ImpulsaCol Backend está funcionando!');
});

// Nueva ruta para probar la conexión a la DB
app.get('/test-db', async (_req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ time: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
