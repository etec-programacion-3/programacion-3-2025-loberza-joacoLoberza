import { Sequelize } from "sequelize";
import { Cart, CartItem } from '../database/models.js';

export const createCart = async (req, res) => {
	try {
		const addedItem = await Cart.create(req.body);
		res.status(200).json({
			success: true,
			message: 'ACK| Cart created successfully.'
		})
	} catch (err) {
		res.status(500).json({
			success: true,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const desrtoyCart =async (req, res) => {
	try {
		const cartToDestroy = Cart.findOne({
			//Swguir acá
		})
	} catch (err) {
		res.status(500).json({
			success: true,
			message: 'ERROR| Internal server error.'
		})
	}
}

export const addItem = async (req, res) => {
	try {
		const addedItem = await CartItem.create(req.body);
		res.status(200).json({
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
	try {
		const itemToRemove = await CartItem.destroy
	} catch (err) {

	}
}

export const getCart = async (req, res) => {

}