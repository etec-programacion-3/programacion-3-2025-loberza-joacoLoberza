import express from 'express';
import { getManager, addProduct, deleteProduct, updateProduct} from '../controllers/handleProducts.js';
import verifyToken from '../middlewares/jwtVerify.js'

const productsRouter = express.Router();
productsRouter.get('/', verifyToken, getManager)
productsRouter.post('/add', verifyToken, addProduct)
productsRouter.put('/:id', verifyToken, updateProduct)
productsRouter.delete('/:id', verifyToken, deleteProduct)