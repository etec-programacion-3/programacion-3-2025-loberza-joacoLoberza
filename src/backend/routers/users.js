import express from "express";
import verifyToken from "../middlewares/jwtVerifyExpress.js";
import { userLogin, userRegister, deleteUser, getUser } from '../controllers/handleUser.js'

const usersRouter = express.Router()
usersRouter.post('/loggin', userLogin)
usersRouter.post('/register', userRegister)
usersRouter.delete('/', verifyToken, deleteUser)
usersRouter.get('/', getUser) //Temporal router

export default usersRouter