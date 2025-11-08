import { Router } from 'express';
import { addCategory, updateCategory, getCategories, deleteCategory } from '../controllers/handleCategory.js';
import verifyToken from '../middlewares/jwtVerifyExpress.js';

const categoryRouter = Router()

categoryRouter.get('/', getCategories)
categoryRouter.post('/', verifyToken, addCategory)
categoryRouter.patch('/:id', verifyToken, updateCategory)
categoryRouter.delete('/:id', verifyToken, deleteCategory)

export default categoryRouter