import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

router.get('/profile', authenticateJWT, (req, res) => {
  // Aquí ya sabemos que el usuario está autenticado
    const user = (req as any).user;
    res.json({ message: 'Perfil de usuario', user });
});

export default router;