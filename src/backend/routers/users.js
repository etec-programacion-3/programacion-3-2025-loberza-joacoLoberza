import express from "express";
import { userLogin, userRegister, getUser } from '../controllers/handleUser.js'

const usersRouter = express.Router()
usersRouter.post('/loggin', userLogin)
usersRouter.post('/register', userRegister)
usersRouter.get('/', getUser)

export default usersRouter