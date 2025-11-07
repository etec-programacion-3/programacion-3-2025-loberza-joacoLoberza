import express from 'express';
import { getManager, addProduct, deleteProduct, updateProduct} from '../controllers/handleProducts.js';
import verifyToken from '../middlewares/jwtVerifyExpress.js'

const productsRouter = express.Router();
productsRouter.get('/', getManager)
productsRouter.post('/add', verifyToken, addProduct)
productsRouter.patch('/:id', verifyToken, updateProduct)
productsRouter.delete('/:id', verifyToken, deleteProduct)

export default productsRouter