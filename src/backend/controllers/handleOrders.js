import { Category, Order, OrderItem, Product, User, Cart, CartItem } from '../database/models.js';
import { Sequelize, Op } from 'sequelize';
import mercadopago from '../config/mercadopago.js';
import sequelize from '../config/database.js';
import { addItem } from './handleCart.js';

class GetOrdersDTO {
	constructor(req) {
		this.limit = req.query.limit ? req.query.limit : 5;
		this.after = req.query.after;
		this.order = req.query.order ? req.query.order.toUpperCase() : 'ASC';
		this.product = req.query.product ? req.query.product : null;
		this.payload = req.payload;
	}

	validateOrder() {
		if (this.order !== 'ASC' && this.order !== 'DESC') {
			throw new Error('Invalid request order.')
		} else {
			this.pagOrder = [['orderNumber', this.order]];
		}
	}

	validateFilter() {
		if (this.after < 0 || this.limit <= 0 || this.limit > 50) {
			throw new Error('Invalid pagination querys.')
		} else {
			this.pagFilter = this.after ? { id: { [Op.gt]: this.after } } : {}
		}
	}

	validateProduct() {
		if (!this.product) {
			throw new Error ('Product name query not sended.')
		} else {
			this.prodFilter = { name: this.product }
		}
	}
}


export const getAllOrders = async (req, res) => {
	try {
		const getAllOrdersDTO = new GetOrdersDTO(req);
		getAllOrdersDTO.validateOrder()
		getAllOrdersDTO.validateFilter()
		const orders = await Order.findAll({
			where: getAllOrdersDTO.pagFilter,
			order: getAllOrdersDTO.pagOrder,
			limit: Number(getAllOrdersDTO.limit),
			include: [
				{
					model: User,
					attributes: ['name', 'id'],
					where: { name: getAllOrdersDTO.payload.id },
					required: true
				},
				{
					model: OrderItem,
					required: true,
					include: {
						model: Product,
						attributes: ['id', 'name', 'price', 'category'],
						required: true,
						include: {
							model:Category,
							required:true
						}
					}
				}
			]
		});

		if (order == []) {
			return res.status(400).json({
				success:false,
				massage:'ERROR| Product not found.'
			})
		}

		res.status(200).json({
			success: true,
			message: 'ACK| Orders found successfully.',
			orders,
			nextCursor: orders.length ? orders[orders.length - 1].id : null,
		})

	} catch (err) {
		res.status(500).json({
			success: false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
}

export const getOrdersByProduct = async (req, res) => {
	try {
		const getOrdersByProdDTO = new GetOrdersDTO(req);
		getOrdersByProdDTO.validateFilter()
		getOrdersByProdDTO.validateOrder()
		getOrdersByProdDTO.validateProduct()
		const orders = await Order.findAll({
			where: getOrdersByProdDTO.pagFilter,
			order: getOrdersByProdDTO.pagOrder,
			limit: Number(getOrdersByProdDTO.limit),
			include: [
				{
					model: User,
					attributes: ['name', 'id'],
					where: { name: getOrdersByProdDTO.payload.name },
					required: true,
				},
				{
					model: OrderItem,
					required: true,
					include: {
						model:Product,
						attributes: ['id', 'name', 'price', 'category'],
						where: getOrdersByProdDTO.prodFilter,
						required: true,
						include: {
							model:Category,
							required:true
						}
					}
				}
      ]
		});

		if (order == []) {
			return res.status(400).json({
				success:false,
				massage:'ERROR| Product not found.'
			})
		}
		
		res.status(200).json({
			success:true,
			message:'ACK| Orders found successfully.',
			orders,
			nextCursor: orders.length ? orders[orders.length - 1].id : null,

		})
  } catch (err) {
		res.status(500).json({
			success: false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
}

export const getOrderById = async (req, res) => {
	try {
		const id = req.params.id;
		const order = await Order.findAll({
			where: { orderNumber:id },
			include: [
				{
					model:User,
					attributes: ['name', 'id'],
					where: { name:req.payload.name },
					required: true
				},
				{
					model:OrderItem,
					required: true,
					include: {
						model: Product,
						attributes: ['id', 'name', 'price', 'category'],
						required: true,
						include: {
							model:Category,
							required:true
						}
					}
				}
			]
		});

		if (order == []) {
			return res.status(400).json({
				success:false,
				massage:'ERROR| Product not found.'
			})
		}

		res.status(200).json({
			success:true,
			message: 'ACK| Order found successfully.',
			order,
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
}

export const createOrder = async (req, res) =>  {
	/*
	Expexted body:
	  {
	    arrivalEarly -> Date
			arrivalLate -> Date
		}
	*/
	const transaction = await sequelize.transaction();
	try {
		const userId = req.payload.id;
		const { arrivalEarly, arrivalLate } = req.body;

		const cart = await Cart.findOne({
			include: [
				{
				model:User,
				attributes: ['id', 'home'],
				where: { id : userId },
				required:true
				},
				{
					model: CartItem,
					required:true
				}
			]
		}, { transaction })

		const shippingAddress = cart.User.home;

		if (!cart) {
			await transaction.rollback()
			return res.status(404).json({
				success:false,
				message:`ERROR| Couldn't found the users cart.`
			})
		}

		const lastUserOrder = await Order.findOne({
			attributes: ['orderNumber'],
			where: { id : userId },
			order: [['orderNumber', 'DESC']]
		}, { transaction });
	
		const newOrderNum = lastUserOrder.orderNumber + 1;

		const newOrder = await Order.create( {
				user: userId,
				orderNumber: newOrderNum,
			}, { transaction }
		)

		let total = 0;
		let preferenceItems = [];

		for (item of cart.CartItem) {
			const product = await Product.findOne({
				include: {
					model:CartItem,
					attributes: [],
					where: { id : item.id },
					required:true
				}
			}, { transaction });

			if (product.stock < item.amount) {
				await transaction.rollback()
				return res.status(400).json({
					success:false,
					message:`ERROR| Insufficient stock for the requested product.`
				})
			}

			total += item.amount * product.price;

			const newOrderItem = await OrderItem.create({
				arrivalEarly,
				arrivalLate,
				product: product.id,
				amount: item.amount,
				order: newOrder.id,
			}, { transaction })

			preferenceItems.push({
				title: product.name,
				unit_price: product.price,
				quantity: item.amount,
				currency_id:'ARS'
			})
		}

		const preference = {
			items: preferenceItems,
			back_urls: {
				success: `${process.env.MERCADOPAGO_SUCCESS_PAY}`,
				failure: `${process.env.MERCADOPAGO_FAILED_PAY}`,
				pending: `${process.env.MERCADOPAGO_PENDING_PAY}`,
			},
			auto_retrun: 'approved',
			external_reference: newOrder.id,
			notification_url: `${prosses.env.MERCADOPAGO_WEBHOOK}`,
      statement_descriptor: 'TIENDAPRO',
      expires:true,
			expiration_date_from: new Date().toISOString(),
			expiration_date_to: new Date( new Date().getTime() + 60 * 60 * 1000 /*1 Hora en milisegundos*/ ).toISOString(),
		}

		const preferenceInfo = await mercadopago.preferences.create(preference);
		const pay_url = preferenceInfo.body.init_point;
		const preferenceId = preferenceInfo.body.id;
		
		await Order.update({
			preferenceId
		}, { where: { orderNumber : newOrderNum } })

		await transaction.commit()

		res.status(200).json({
			success:true,
			message: 'ACK| Order and payment created successfully.',
			order: {
				orderNumber: newOrderNum,
				total,
				status: 'pending'
			},
			pay_url
		})

	} catch (err) {
		transaction.rollback()
		res.status(500).json({
			success:false,
			message: `ERROR| Internal server error.`
		})
	}
}