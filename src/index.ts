import express from 'express';
import authRoutes from './adapters/routes/authRoutes';
import protectedRoutes from './adapters/routes/protectedRoutes';

const app = express();
const port = 3000;

app.use(express.json());

// Rutas públicas de autenticación
app.use('/api', authRoutes);

// Rutas protegidas (requieren JWT válido)
app.use('/api/protected', protectedRoutes);

// Ruta base para comprobar funcionamiento del backend
app.get('/', (_req, res) => {
    res.send('¡ImpulsaCol Backend está funcionando!');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
