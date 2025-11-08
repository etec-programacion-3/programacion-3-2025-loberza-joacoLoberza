import sequelize from "../config/database.js";
import { Sequelize, Model, DataTypes, ValidationError } from "sequelize";
import bcrypt from "bcrypt";

export class User extends Model { }
User.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
    validate: {
        isEmail: {
            msg: "No se ingresó un e-mail correcto en el campo de e-mail de la tabla User"
        }
    }
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	roll: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
        isIn: {
            args: [['client', 'admin']],
            msg: "El roll del usuario no es el correcto, debe ser client o admin."
        }
    }
	},
	dni: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	home: {
		type: DataTypes.STRING,
		allowNull: false,
	}
},
	{ sequelize }
)

User.beforeCreate(async (user) => {
	if (user.password) {
		const saltRounds = 10;
		user.password = await bcrypt.hash(user.password, saltRounds)
	}
})

User.beforeUpdate(async (user) => {
	if (user.changed("password")) {
		const slatRounds = 10;
		user.password = await bcrypt.hash(user.password, slatRounds)
	}
})

export class Category extends Model { }
Category.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	isDefault: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
},
	{ sequelize }
)

export class Product extends Model { }
Product.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false
	},
	price: {
		type: DataTypes.DECIMAL,
		allowNull: false,
		validate: {
			min:0
		}
	},
	stock: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min:0
		}
	},
	category: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Category,
			key: 'id'
		},
		validate: {
			min: 0
		}
	}
},
	{ sequelize }
)

export class Cart extends Model {}
Cart.init({
	id:{
		type:DataTypes.INTEGER,
		primaryKey:true,
		autoIncrement:true
	},
	user: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model:User,
			key:'id',
		},
		validate: {
			min:0
		}
	}
},
	{ sequelize }
)

export class CartItem extends Model { }
CartItem.init({
	id: {
		type:DataTypes.INTEGER,
		primaryKey:true,
		autoIncrement:true
	},
	product: {
		type:DataTypes.INTEGER,
		allowNull:false,
		references: {
			model:Product,
			key:'id',
		},
		validate: {
			min:0
		}
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull:false,
		defaultValue: 1,
		validate: {
			min:0
		}
	},
	cart: {
		type: DataTypes.INTEGER,
		allowNull:false,
		references: {
			model:Cart,
			key: 'id'
		}
	},
},
	{ sequelize }
)

export class Order extends Model { }
Order.init({
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		user: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: 'id'
			},
			validate: {
				min:0
			}
		},
		status: {
			type: DataTypes.ENUM('pending', 'cancelled', 'returned', 'refunded', 'failed', 'paid'),
			defaultValue: 'pending',
		},
		orderNumber: { //Thisone is the number of order of the user. References the amount of orders that he've done (not the id from the data base, is like an id for the orders of each user).
			type: DataTypes.INTEGER,
			allowNull: false
		},
		paidAt: {
			type: DataTypes.DATE,
		},
		paymentId: {
			type: DataTypes.INTEGER,
		},
		preferenceId: {
			type: DataTypes.INTEGER,
		}
	},
	{
		sequelize,
		timestamps: true
	}
)

Order.beforeUpdate(async (order) => {
	if (order.status === 'paid' && (order.paymentId === undefined || order.preferenceId === undefined || order.paidAt === undefined)) {
		throw new ValidationError(`'paidAt', 'paymentId' and 'preferenceId' fields are required`)
	}
})

export class OrderItem extends Model { }
OrderItem.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	arrivalEarly: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	arrivalLate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	arrivalTrue: {
		type: DataTypes.DATE,
		defaultValue: undefined
	},
	state: {
		type: DataTypes.ENUM('processing', 'shipped', 'delivered', 'failed'),
		defaultValue: 'processing'
	},
	product: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Product,
			key: 'id'
		},
		validate: {
			min:0
		}
	},
	amount: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		validate: {
			min:1
		}
	},
	order: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Order,
			key: 'id'
		},
		validate: {
			min:0
		}
	}
},
	{ sequelize }
)

export class Chat extends Model { }
Chat.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	type: {
		type: DataTypes.ENUM('group', 'contact'),
		allowNull:false
	},
	name: {
		type: DataTypes.STRING,
		allowNull:false
	}
},
	{ sequelize }
)

export class Message extends Model { }
Message.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	content: {
		type: DataTypes.STRING,
		allowNull: false
	},
	sendedBy: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: User,
			key: 'id'
		},
		validate: {
			min:0
		}
	},
	seen: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	seenBy: {
		type: DataTypes.STRING,
		defaultValue: '[]', // Expexted: '[userId, userId, userId ...]'
		get() {
			const users = this.getDataValue('seenBy')
			return users ? JSON.parse(users) : []
		},
		set(users) {
			this.setDataValue('seenBy', JSON.stringify(users))
		}
	},
	chat: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Chat,
			key: 'id'
		},
		validate: {
			min:0
		}
	}
},
	{
		sequelize,
		timestamps: true
	}
)

export class UserChat extends Model { }
UserChat.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	userFk: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: User,
			key: 'id'
		},
		validate: {
			min:0
		}
	},
	chatFk: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: Chat,
			key: 'id'
		},
		validate: {
			min:0
		}
	},
	isAdmin: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	}
}, { sequelize })

User.hasMany(Order, {
    foreignKey: 'user'
})
Order.belongsTo(User, {
    foreignKey: 'user'
})

User.hasMany(Message, {
    foreignKey: 'sendedBy'
})
Message.belongsTo(User, {
    foreignKey: 'sendedBy'
})

User.belongsToMany(Chat, {
    through: UserChat,
    foreignKey: 'userFk',
		onDelete: 'CASCADE'
})
Chat.belongsToMany(User, {
    through: UserChat,
    foreignKey: 'chatFk',
		onDelete: 'CASCADE'
})

Chat.hasMany(Message, {
    foreignKey: 'chat'
})
Message.belongsTo(Chat, {
    foreignKey: 'chat'
})

Cart.hasMany(CartItem, {
    foreignKey: 'cart'
})
CartItem.belongsTo(Cart, {
    foreignKey: 'cart'
})

Category.hasMany(Product, {
    foreignKey: 'category'
})
Product.belongsTo(Category, {
    foreignKey: 'category'
})

Order.hasMany(OrderItem, {
    foreignKey: 'order'
})
OrderItem.belongsTo(Order, {
    foreignKey: 'order'
})

Product.hasMany(OrderItem, {
    foreignKey: 'product'
})
OrderItem.belongsTo(Product, {
    foreignKey: 'product'
})

User.hasOne(Cart, {
    foreignKey: 'user'
})
Cart.belongsTo(User, {
    foreignKey: 'user'
})

Product.hasMany(CartItem, {
    foreignKey: 'product'
})
CartItem.belongsTo(Product, {
    foreignKey: 'product'
})

export const integrate = async () => {
	try {
		console.log("Verificando conexión con la base de datos...")
		await sequelize.authenticate()

		console.log("Sincronizando las tablas nuevas con la base de datos...")
		await sequelize.sync()
	} catch (err) {
		throw new Error(`ERROR: Hubo un problema con la autenticación o con la sincronización de las tablas con la base de datos.\n    Más información:\n    ${err}`)
	}
};