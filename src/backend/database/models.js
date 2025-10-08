import sequelize from "./database.js";
import { Sequelize, Model, DataTypes, Model, INTEGER, DATE } from "sequelize";
import { bcrypt } from "bcrypt";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

export class User extends Model{}
User.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoincrement:true
    },
    name:{
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
    password: {
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
    if (user.password) {
        const slatRounds = 10;
        user.password = await bcrypt.hash(user.password, slatRounds)
    }
})

User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
        const slatRounds = 10;
        user.password = await bcrypt.hash(user.password, slatRounds)
    }
})

export class Product extends Model{}
Product.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name: {
        type:DataTypes.STRING,
        allowNull:false
    },
    description: {
        type:DataTypes.STRING,
        allowNull:false
    },
    price: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    stock: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    category: {
        type:DataTypes.STRING,
        allowNull:false
    }
},
{sequelize}
)

export class Order extends Model{}
Order.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user: {
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: User,
            key: 'id'
        }
    },
    orderNumber: { //Thisone is the number of order of the user. References the amount of orders that he've done.
        type:DataTypes.INTEGER,
        allowNull:false
    }
},
{
    sequelize,
    timestamps:true
}
)

export class OrderItem extends Model{}
OrderItem.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    arrivalEarly: {
        type:DataTypes.DATE,
        allowNull: false,
    },
    arrivalLate: {
        type:DataTypes.DATE,
        allowNull:false
    },
    arrivalTrue: {
        type:DataTypes.DATE,
        defaultValue: null
    },
    state: {
        type:DataTypes.ENUM('pending', 'prossesing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded', 'failed'),
        defaultValue: 'pending'
    },
    prodcut: {
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Product,
            key: 'id'
        }
    },
    order: {
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Order,
            key: 'id'
        }
    }
},
{sequelize}
)

export class Chat extends Model{}
Chat.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    }

},
{sequelize}
)

export class Message extends Model{}
Message.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    content: {
        type:DataTypes.STRING,
        allowNull:false
    },
    sendedBy: {
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: User,
            key: 'id'
        }
    },
    chat: {
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model:Chat,
            key: 'id'
        }
    }
},
{
    sequelize,
    timestamps:true
}
)

User.hasMany(Order)
Order.belongsTo(User)

User.hasMany(Message)
Message.belongsTo(User)

User.belongsToMany(Chat, {
    through:'UserChat',
    foreignKey:'userFk',
    otherKey:'chatFk'
})
Chat.belongsToMany(User, {
    through:'UserChat',
    foreignKey:'chatFk',
    otherKey:'userFk'
})

Chat.hasMany(Message)
Message.belongsTo(Chat)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

Product.hasMany(OrderItem)
OrderItem.belongsTo(Product)

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