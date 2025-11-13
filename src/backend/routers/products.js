import express from 'express';
import { getManager, addProduct, deleteProduct, updateProduct, getProductById} from '../controllers/handleProducts.js';
import verifyToken from '../middlewares/jwtVerifyExpress.js'

const productsRouter = express.Router();
productsRouter.get('/', getManager)
productsRouter.get('/:id', getProductById)
productsRouter.post('/', verifyToken, addProduct)
productsRouter.patch('/:id', verifyToken, updateProduct)
productsRouter.delete('/:id', verifyToken, deleteProduct)

export default productsRouter