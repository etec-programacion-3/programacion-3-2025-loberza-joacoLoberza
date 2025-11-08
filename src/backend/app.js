import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import { config } from "dotenv";
import { integrate } from "./database/models.js";
import verifyTokenSocket from "./middlewares/jwtVerifySocket.js";
import usersRouter from "./routers/users.js";
import productsRouter from "./routers/products.js";
import cartRouter from "./routers/cart.js";
import chatsRouter from "./routers/chats.js";
import categoryRouter from "./routers/categorys.js";
import messagesConnection from "./socket.io/handlers/messages.js";

//Creamos el proceso de express y el puerto para el servidor.
const app = express();
const PORT = process.env.PORT || 3000;

//Midlewares y router raíz para express.
app.use(express.json());
app.use(cors({
  origin:'*' //CAMBIAR CUNADO EMPIEZE EL FRONTEND
}));
app.use("/user", usersRouter)
app.use("/products", productsRouter)
app.use("/cart", cartRouter)
app.use("/chats", chatsRouter)
app.use("/category", categoryRouter)

//Creamos el servidor HTTP.
const server = createServer(app)

//Creamos el proceso de Socket.io (eventos).
export const io = new Server(server, {
  cors: {
    origin: '*' //CAMBIAR CUNADO EMPIEZE EL FRONTEND
  }
})

//Midlewares y conección para socket.io.
io.use(verifyTokenSocket)
io.on('connection', messagesConnection)

//Creamos el servidor.
try {
  integrate();
  server.listen(PORT, () => {
    console.log(`Servidor inciado en el puerto ${PORT}...`);
  });
} catch (err) {
  throw new Error(`ERROR:\n  No se ha podido inciar el servidor... - ${err}`);
}
