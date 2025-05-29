import express from 'express';

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
    res.send('¡ImpulsaCol Backend está funcionando!');
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
