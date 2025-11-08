import { getChats, getChatById, deleteChat, createChat, updateChatMembers, verifyOwnSeen } from "../controllers/handleChats.js";
import express from 'express';
import verifyToken from '../middlewares/jwtVerifyExpress.js';

const chatsRouter = express.Router()

chatsRouter.get('/', verifyToken, getChats)
chatsRouter.get('/:id', verifyToken, getChatById)
chatsRouter.delete('/:id', verifyToken, deleteChat)
chatsRouter.post('/', verifyToken, createChat)
chatsRouter.patch('/:id', verifyToken, updateChatMembers)
chatsRouter.get('/ownseen/:id', verifyToken, verifyOwnSeen)

export default chatsRouter