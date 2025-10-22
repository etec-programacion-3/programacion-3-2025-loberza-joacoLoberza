import express from "express";
import cors from "cors";
import { config } from "dotenv";
import usersRouter from "./routers/users.js";
import productsRouter from "./routers/products.js"

//Creamos el proceso de express y el puerto para el servidor.
const app = express();
const PORT = process.env.PORT || 3000;

//Midlewares y router raíz.
app.use(express.json());
app.use(cors());
app.use("/user", usersRouter);
app.use("/products", productsRouter);

//Creamos el servidor.
try {
  app.listen(PORT, () => {
    console.log(`Servidor inciado en el puerto ${PORT}...`);
  });
} catch (err) {
  throw new Error(`ERROR:\n  No se ha podido inciar el servidor... - ${err}`);
}
