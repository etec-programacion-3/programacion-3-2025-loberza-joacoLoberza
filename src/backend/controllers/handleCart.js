import { InvalidConnectionError, Model, Op, Sequelize } from "sequelize";
import { Cart, CartItem, Category, Product, User } from '../database/models.js';

class GetCartDTO {
	constructor(req) {
		this.after = req.query.after;
		this.limit = req.query.limit ? req.query.limit : 5;
		this.order = req.query.order ? req.query.order : 'ASC';
		this.search = req.query.search;
	}

	validateOrder() {
    if (this.order != "ASC" && this.order != "DESC") {
			throw new Error('Invalid request order.')
    }
  }

	validateFilter() {
		if (this.after < 0 || this.limit <= 0 || this.limit > 50) {
			throw new Error('Invalid pagination querys.')
		} else {
			this.pagFilter = this.after ? { id: { [Op.gt]: this.after } } : {}
		}
	}
}

export const createCart = async (req, res) => {
	// Body isn't expected.
	try {
		const userId = (await User.findOne({
			attributes:['id'],
			where: req.payload.user
		}))?.id;
		const addedItem = await Cart.create({
			user:userId
		});
		res.status(201).json({
			success: true,
			message: 'ACK| Cart created successfully.'
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const desrtoyCart =async (req, res) => {
	try {
		const cartToDestroy = await Cart.findOne({
			include: {
				model:User,
				attributes:['id'],
				where: { id: req.payload.id },
				required:true
			}
		});
		if (!cartToDestroy) {
			return res.status(400).json({
				success:false,
				message: `ERROR| Couldn't find the cart.`
			})
		}
		await cartToDestroy.destroy()
		res.status(200).json({
			success:true,
			message: 'ACK| Cart destoryed successfully.'
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const addItem = async (req, res) => {
	/*
		Expexted body:
		{
		user:string,
		product: string,
		amount: int
		}
	*/
	try {
		const userId = payload.id;
		const prodId = (await Product.findOne({
			attributes:['id'],
			where: { name: req.body.product}
		}))?.id;
		const cartId = (await Cart.findOne({
			where: { user: userId },
			attributes: ['id']
		}))?.id
		if (!userId) return res.status(404).json({
			success:false,
			message: `ERROR| User resource not found.`
		})
		const addedItem = await CartItem.create({
			user: userId,
			product: prodId,
			amount: req.body.amount,
			cart: cartId
		});
		res.status(201).json({
			success: true,
			message: 'ACK| Item added successfully.'
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const deleteItem = async (req, res) => {
	/*
		Expexted querys:
			product=name_of_product
	*/
	try {
		const itemToRemove = await CartItem.findOne({
			include: {
				model:Product,
				where:{ name : req.query.product },
				required:true
			}
		})
		if (!itemToRemove) return res.status(404).json({
			success:false,
			message:'ERROR| Product not found in the data base.'
		})
		await itemToRemove.destroy()
		res.status(200).json({
			success:true,
			message:'ACK| Product quited successfully from the cart.'
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const getCart = async (req, res) => {
	try {
		const getCartDTO = new GetCartDTO(req);
		getCartDTO.validateFilter()
		getCartDTO.validateOrder()
		const cart = await Cart.findOne({
			where: { user:req.payload.user },
			include: {
				model:CartItem,
				where:getCartDTO.pagFilter,
				required:true,
				include : {
					model:Product,
					required:true,
					include: {
						model:Category,
						required:true
					}
				}
			}
		});
		if (!cart) return res.status(404).json({
			success:false,
			message: 'ERROR| Cart not found.'
		})

		let items = cart.CartItems || [];

		if (getCartDTO.after) {
			items = items.filter( item => item.id > getCartDTO.after )
		}

		items = items.slice(0, getCartDTO.limit)
		if (getCartDTO.order === 'DESC') items.reverse()
		cart.CartItems = items;

		res.status(200).json({
			success:true,
			message:'ACK| Cart got successfully.',
			cart,
			nextCursor: items.length ? items[items.length - 1].id : null,
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const getCartIemsByName = async (req, res) => {
	try {
		const getCartItemsByNameDTO = new GetCartDTO(req);
		getCartItemsByNameDTO.validateFilter()
		getCartItemsByNameDTO.validateOrder()

		if (!getCartItemsByNameDTO.search) {
			return res.status(400).json({
					success: false,
					message: 'ERROR| Search parameter is required.'
			})
		}

		const cart  = await Cart.findOne({
			where:{ user: req.payload.user},
			include: {
				model: CartItem,
				where: getCartItemsByNameDTO.pagFilter,
				required: true,
				include : {
					model:Product,
					required:true,
					where: {name: { [Op.like] : `%${getCartItemsByNameDTO.search}%` }},
					include: {
						model:Category,
						required:true
					}
				}
			}
		})

		if (!cart) return res.status(404).json({
			success:false,
			message: `ERROR| Cart not found.`
		})

		let items = cart.CartItems || [];

		if (getCartItemsByNameDTO.after) {
			items = items.filter( item => item.id > getCartItemsByNameDTO.after )
		}

		items = items.slice(0, getCartItemsByNameDTO.limit)
		if (getCartItemsByNameDTO.order === 'DESC') items.reverse()
		cart.CartItems = items;

		res.status(200).json({
			success: true,
			message: 'ACK| Cart items got successfully.',
			cart,
			nextCursor: items.length ? items[items.length - 1].id : null,
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}