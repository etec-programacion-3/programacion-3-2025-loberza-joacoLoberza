import sequelize from "./database.js";
import { Sequelize, Model, DataTypes, Model, INTEGER } from "sequelize";
import { bcrypt } from "bcrypt";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

class User extends Model{}
User.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoincrement:true
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    email: {
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validation(value) {
            if (!value.includes("@")) {
                throw new Error("No se ingresó un e-mail correcto en el campo de e-mail de la tabla User")
            }
        }
    },
    clave: {
        type:DataTypes.STRING,
        allowNull:false,
    },
    roll: {
        type:DataTypes.STRING,
        allowNull:false,
        validation(value) {
            if (!value === "cliente" || !value === "admin") {
                throw new Error("El roll del usuario no es el correcto, debe ser cliente o admin.")
            }
        }
    }
},
{sequelize}
)

User.beforeCreate(async (user) => {
    if (user.clave) {
        const slatRounds = 10;
        user.clave = await bcrypt.hash(user.clave, slatRounds)
    }
})

User.beforeUpdate(async (user) => {
    if (user.changed("clave")) {
        const slatRounds = 10;
        user.clave = await bcrypt.hash(user.clave, slatRounds)
    }
})

class Product extends Model{}
Product.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre: {
        type:DataTypes.STRING,
        allowNull:false
    },
    descripcion: {
        type:DataTypes.STRING,
        allowNull:false
    },
    precio: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    stock: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    categoria: {
        type:DataTypes.STRING,
        allowNull:false
    }
},
{sequelize}
)

class Order extends Model{}
Order.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    }
},
{sequelize}
)

class OrderItem extends Model{}
OrderItem.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    }
},
{sequelize}
)

// Hasta acá llegamos, faltan los últimos dos modelos y las relcaiones.

(async () => {
    try {
        console.log("Verificando conexión con la base de datos...")
        await sequelize.authenticate()

        console.log("Sincronizando las tablas nuevas con la base de datos...")
        await sequelize.sync()
    } catch (err) {
        throw new Error (`ERROR: Hubo un problema con la autenticación o con la sincronización de las tablas con la base de datos.\n    Más información:\n    ${err}`)
    }
    
})();