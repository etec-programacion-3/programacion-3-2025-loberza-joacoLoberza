import { Op } from "sequelize";
import { Cart, CartItem, Category, Product, User } from '../database/models.js';
import sequelize from '../config/database.js';

class GetCartDTO {
	constructor(req) {
		    console.log('Valores originales:', {
        after: req.query.after,
        limit: req.query.limit,
        tipo_after: typeof req.query.after,
        tipo_limit: typeof req.query.limit
    });
    this.after = req.query.after !== undefined ? parseInt(req.query.after) : null;
    this.limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 5;
    this.order = (req.query.order || 'ASC').toUpperCase();
    this.search = req.query.search;

		console.log('Valores parseados:', {
			after: this.after,
			limit: this.limit,
			tipo_after: typeof this.after,
			tipo_limit: typeof this.limit
		});
	}

	validateOrder() {
    if (this.order != "ASC" && this.order != "DESC") {
			throw new Error('Invalid request order.')
    }
  }

	validateFilter() {
		if ((this.after !== null && this.after < 0) || this.limit <= 0 || this.limit > 50) {
			throw new Error('Invalid pagination querys.')
		} else {
			this.pagFilter = this.after ? { id: { [Op.gt]: this.after } } : {}
		}
	}
}

export const addItem = async (req, res) => {
	/*
		Expexted body:
		{
		product: string,
		amount: int
		}
	*/
	try {
		const userId = req.payload.id;
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
		Expexted Params: :id -> Id of the cart item.
	*/
	try {
		const cart = await Cart.findOne({
			where: { user: req.payload.id },
			attributes: ['id']
		});

		if (!cart) {
			return res.status(404).json({
				success: false,
				message: 'ERROR| Cart not found.'
			});
		}

		const itemToRemove = await CartItem.findOne({
			where: { cart: cart.id, id:req.params.id }
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
		//Instance DTO to configure the serach parameters.
		const getCartDTO = new GetCartDTO(req); 

		getCartDTO.validateFilter()
		getCartDTO.validateOrder()

		//Instance the cart 
		const cart = await Cart.findOne({
			where: { user:req.payload.id },
			include: {
				model: CartItem,
				separate: true,
				limit: getCartDTO.limit,
				order: [['id', getCartDTO.order]],
				include: {
						model: Product,
						required: true,
						include: {
								model: Category,
								required: true
						}
				}
			}
		});
		
		if (!cart) return res.status(404).json({
			success:false,
			message: 'ERROR| Cart not found.'
		})

		res.status(200).json({
			success:true,
			message:'ACK| Cart got successfully.',
			cart,
			nextCursor: cart.CartItems.length ? cart.CartItems[cart.CartItems.length - 1].id : null,
		})
	} catch (err) {
		res.status(500).json({
			limit: req.query.limit,
			success: false,
			message: 'ERROR| Internal server error.',
			err
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

	  const cart = await Cart.findOne({
      where: { user: req.payload.id },
      include: {
        model: CartItem,
        separate: true,
        where: getCartItemsByNameDTO.pagFilter,
        order: [['id', getCartItemsByNameDTO.order]],
        limit: getCartItemsByNameDTO.limit,
        include: {
          model: Product,
          required: true,
          where: { name: { [Op.like]: `%${getCartItemsByNameDTO.search}%` } },
          include: {
            model: Category,
            required: true
          }
        }
      }
    });

		if (!cart) return res.status(404).json({
			success:false,
			message: `ERROR| Cart not found.`
		})

		res.status(200).json({
			success: true,
			message: 'ACK| Cart items got successfully.',
			cart,
			nextCursor: cart.CartItems.length ? cart.CartItems[cart.CartItems.length - 1].id : null,
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'ERROR| Internal server error.'
		})
	}
}