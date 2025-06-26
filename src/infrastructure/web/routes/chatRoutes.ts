import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import express from 'express';

export const createChatRoutes = (chatController: ChatController): Router => {
    const router = Router();
    const jsonParser = express.json();

    // Todas las rutas de chat requieren autenticación (se aplica en ServerBootstrap)

    // GET /api/chats - Obtener todos los chats del usuario
    router.get('/', chatController.getUserChats);

    // POST /api/chats - Crear o obtener un chat existente
    router.post('/', jsonParser, chatController.createOrGetChat);

    // GET /api/chats/:id - Obtener un chat específico
    router.get('/:id', chatController.getChatById);

    // GET /api/chats/:id/messages - Obtener mensajes de un chat
    router.get('/:id/messages', chatController.getChatMessages);

    // POST /api/chats/:id/messages - Enviar un mensaje
    router.post('/:id/messages', jsonParser, chatController.sendMessage);

    return router;
}; 