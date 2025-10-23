import { Order, OrderItem, User } from '../database/models.js';
import { Sequelize, Op, or } from 'sequelize';

class getOrdersDTO {
    constructor(req) {
        this.limit = req.query.limit ? req.query.limit : 5;
        this.after = req.query.after;
        this.order = req.query.order;
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
            this.pagFilter = this.after ? { id:{ [Op.gt] : this.after } } : {}
        }
    }
}


export const getAllOrders = async (req, res) => {
    try {
        const getAllOrdersDTO = new getOrdersDTO(req);
        getAllOrdersDTO.validateOrder()
        getAllOrdersDTO.validateFilter()
        const orders = await Order.findAll({
            where: getAllOrdersDTO.pagFilter,
            order: getAllOrdersDTO.pagOrder,
            limit: Number(getAllOrdersDTO.limit),
            include: {
                model: User,
                where: { name : req.payload.name },
                required: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'ACK| Orders found successfully.',
            orders,
            nextCursor: products.length ? products[products.length - 1].id : null,
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `ERROR| Internal server error:\n  ${err}`
        })
    }
}

export const getOrdersById = async (req, res) => {
    try {
        const getOrdersByIdDTO = new getOrdersDTO(req);
    } catch (err) {

    }
}