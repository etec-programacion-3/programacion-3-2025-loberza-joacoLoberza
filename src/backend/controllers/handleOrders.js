import { Order, OrderItem } from '../database/models.js';
import { Sequelize } from 'sequelize';

class getOrdersDTO {
    constructor(req, res) {
        
    }
}


export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        
    } catch (err) {

    }
}