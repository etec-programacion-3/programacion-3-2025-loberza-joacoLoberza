import { Category, Product } from '../database/models.js'
import { Op, Sequelize } from 'sequelize';

export class MasterProductsGetDTO {
	constructor (data, res) {
		this.after = data.after,
		this.limit = data.limit ? data.limit : 10,
		this.order = data.order || 'ASC',
		this.res = res
	}

	orderValid () {
		if (this.order != 'ASC' && this.order != 'DESC') { return res.status(400).json({
			success:false,
			message:'ERROR| Incorrect order value request.'
		}) }
	}

}

export const getAllProducts = async (req, res) => {
	try {
		const reqData = req.query;
		const prodGetDTO = new MasterProductsGetDTO (reqData, res);
		prodGetDTO.orderValid()
		const pagFilter = prodGetDTO.after ? { id: { [Op.gt]: prodGetDTO.after } } : {};
		const pagOrder = [['id', `${prodGetDTO.order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(prodGetDTO.limit)
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
		const reqData = req.query;
		class GetProdByCatDTO extends MasterProductsGetDTO {
			constructor (data, res) {
				super(data, res)
				this.cat = data.cat,
				this.catArray = []
			}

			async catValid () {
				this.categorys = await Category.findAll()
				for (let cat of categorys) {
					this.catArray.push(cat.name)
				}

				if (!this.catArray.includes(this.cat)) { return res.status(400).json({
					success:false,
					message: `ERROR| Category not found in the database (doesn't exist).`
				}) }
			}
		}
		const prodReqDTO = new GetProdByCatDTO (reqData, res);
		prodReqDTO.orderValid()
		await prodReqDTO.catValid()

		const pagFilter = prodReqDTO.after ? { id: { [Op.gt]: prodReqDTO.after }, category: prodReqDTO.cat } : { category: prodReqDTO.cat };
		const pagOrder = [['id', `${prodReqDTO.order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(prodReqDTO.limit)
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
		const reqData = req.query;
		const prodGetDTO =  new MasterProductsGetDTO (reqData, res);
		prodGetDTO.orderValid()
		const pagFilter = prodGetDTO.after && reqData.name ? { id: { [Op.gt]: prodGetDTO.after }, name: reqData.name} : {};
		const pagOrder = [['id', `${prodGetDTO.order}`]];
		const products = await Product.findAll({
			where: pagFilter,
			order: pagOrder,
			limit: Number(prodGetDTO.limit)
		});

		if (products.length === 0) { return res.status(400).json({
			success:true,
			message: `ERROR| Product not found.`
		}) }

		res.status(200).json({
			success: true,
			message: `ACK| Successfull products get.`,
			products,
			nextCursor: products.length ? products[products.length - 1].id : null
		})

	} catch (err) {
		res.status(500).json({
			success:false,
			message: `ERROR| Internal server error:\n  ${err}`
		})
	}
};