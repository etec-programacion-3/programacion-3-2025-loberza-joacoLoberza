import { Category, Order, OrderItem, Product, User } from '../database/models.js';
import { Sequelize, Op } from 'sequelize';

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