import express from "express";
import { userLogin, userRegister } from '../controllers/handleUser.js'

const usersRouter = express.Router()
usersRouter.post('/loggin', userLogin)
usersRouter.post('/register', userRegister)

export default {usersRouter}