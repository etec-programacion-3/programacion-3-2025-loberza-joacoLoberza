import e from 'express'
import { Product } from '../database/models.js'
import { Op, or, Sequelize } from 'sequelize';

export const getAllPrducts = async (req, res) => {
	try {
		const { after, limit = 10, order = 'ASC'} = req.query;
		const pagFilter = after ? { id: { [Op.gt]: after } } : {};
		const pagOrder = [['id', `${order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(limit)
		});

		res.status(200).json({
			success: true,
			message: `ACK| Successfull products get.`,
			products,
			nextCursor: products.length ? products[products.length - 1].id : null
		})

	} catch (err) {
		res.status(500).json({
			success: false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
};

export const getProductsByCategory = async (req, res) => {
	try {
		const { after, limit = 10, cat } = req.query;
		const pagFilter = after ? { id: { [Op.gt]: after }, category: cat } : { category: cat };
		const pagOrder = [['id', `${order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(limit)
		});

		res.status(200).json({
			success: true,
			message: `ACK| Successfull products get.`,
			products,
			nextCursor: products.length ? products[products.length - 1].id : null
		})
	} catch (err) {
		res.status(500).json({
			success: false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
};

export const getProductsByName = async (req, res) => {
	try {
		const { after, limit = 10 , name} = req.query;
		const pagFilter = after && name ? { id: { [Op.gt]: after }, name} : {null};
		const pagOrder = [['id', `${order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(limit)
		});

		res.status(200).json({
			success: true,
			message: `ACK| Successfull products get.`,
			products,
			nextCursor: products.length ? products[products.length - 1].id : null
		})

	} catch (err) {

	}
};