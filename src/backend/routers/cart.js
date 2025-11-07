import { getCart, getCartIemsByName, addItem, deleteItem } from "../controllers/handleCart"; 
import express from "express";
import verifyToken from '../middlewares/jwtVerifyExpress.js'

const cartRouter = express.Router()

cartRouter.get('/',verifyToken, getCart)
cartRouter.get('/items', verifyToken, getCartIemsByName)
cartRouter.post('/', verifyToken, addItem)
cartRouter.delete('/', verifyToken, deleteItem)

export default cartRouter