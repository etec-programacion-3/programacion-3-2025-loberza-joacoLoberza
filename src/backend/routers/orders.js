import express from 'express';
import verifyToken from '../middlewares/jwtVerify';
import { getAllOrders, getOrderById, getOrdersByProduct, createOrder } from '../controllers/handleOrders';

const orderRouter = express.Router()

orderRouter.get('/', verifyToken, getAllOrders)
orderRouter.get('/:id', verifyToken, getOrderById)
orderRouter.get('/product', verifyToken, getOrdersByProduct)
orderRouter.post('/', verifyToken, createOrder)