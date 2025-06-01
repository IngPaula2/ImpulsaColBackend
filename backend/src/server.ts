import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AuthController } from './adapters/auth.controller';

const app = express();
app.use(cors());
app.use(json());

app.post('/api/auth/register', async (req, res) => {
  await AuthController.register(req, res);
});
app.post('/api/auth/login', async (req, res) => {
  await AuthController.login(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
}); 