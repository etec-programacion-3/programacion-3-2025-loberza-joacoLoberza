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
		validation(value) {
			if (!value.includes("@")) {
				throw new Error("No se ingresó un e-mail correcto en el campo de e-mail de la tabla User")
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
		validation(value) {
			if (value !== "client" || value !== "admin") {
				throw new Error("El roll del usuario no es el correcto, debe ser cliente o admin.")
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
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model: Category,
			key: 'id'
		},
		validate: {
			min:0
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
	}
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
			type: DataTypes.STRING.ENUM('pending', 'cancelled', 'returned', 'refunded', 'failed', 'paid'),
			defaultValue: 'pending',
		},
		orderNumber: { //Thisone is the number of order of the user. References the amount of orders that he've done (not the id from the data base, is like an id for the orders of each user).
			type: DataTypes.INTEGER,
			allowNull: false
		},
		paymentId: {
			type: DataTypes.INTEGER,
		},
		preferencesId: {
			type: DataTypes.INTEGER,
		}
	},
	{
		sequelize,
		timestamps: true
	}
)

Order.beforeUpdate(async (order) => {
	if (order.status === 'paid' && (paymentId === undefined || preferencesId === undefined)) {
		throw new ValidationError(`'paymentId' and 'preferencesId' fields are required`)
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
		defaultValue: null
	},
	state: {
		type: DataTypes.ENUM('prossesing', 'shipped', 'delivered', 'failed'),
		defaultValue: 'pending'
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

User.hasMany(Order)
Order.belongsTo(User)

User.hasMany(Message)
Message.belongsTo(User)

User.belongsToMany(Chat, {
	through: 'UserChat',
	foreignKey: 'userFk',
	otherKey: 'chatFk'
})
Chat.belongsToMany(User, {
	through: 'UserChat',
	foreignKey: 'chatFk',
	otherKey: 'userFk'
})

Chat.hasMany(Message)
Message.belongsTo(Chat)

Cart.hasMany(CartItem)
CartItem.belongsTo(Cart)

Category.hasMany(Product)
Product.belongsTo(Category)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

Product.hasMany(OrderItem)
OrderItem.belongsTo(Product)

User.hasOne(Cart)
Cart.belongsTo(User)

Product.hasMany(CartItem)
CartItem.belongsTo(Product)

const integrate = async () => {
	try {
		console.log("Verificando conexión con la base de datos...")
		await sequelize.authenticate()

		console.log("Sincronizando las tablas nuevas con la base de datos...")
		await sequelize.sync()
	} catch (err) {
		throw new Error(`ERROR: Hubo un problema con la autenticación o con la sincronización de las tablas con la base de datos.\n    Más información:\n    ${err}`)
	}
};

integrate ()