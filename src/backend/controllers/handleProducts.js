import { Category, Product } from "../database/models.js";
import { Op, Sequelize } from "sequelize";

class AccessRequiredDTO {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.id = req.params.id;
	}

	verifyRoll () {
		if (this.req.payload.roll !== 'admin') {
			throw new Error('Unauthorized.')
		}
	}
}

class MasterProductsGetDTO {
  constructor(data, res) {
    this.after = data.after;
    this.limit = data.limit ? data.limit : 10;
    this.order = data.order || "ASC";
    this.res = res;
  }

  orderValid() {
    if (this.order != "ASC" && this.order != "DESC") {
			throw new Error('Invalid request order.')
    }
  }
}

export const getManager = (req, res) => {
	const reqData = req.query;
  const { cat = false, name = false } = reqData;
	if (name) {
		return getProductsByName(req, res)
	} else if (cat) {
		return getProductsByCategory(req, res)
	} else {
		return getAllProducts(req, res)
	}
}

const getAllProducts = async (req, res) => {
  try {
    const reqData = req.query;
    const prodGetDTO = new MasterProductsGetDTO(reqData, res);
    prodGetDTO.orderValid();
    const pagFilter = prodGetDTO.after ? { id: { [Op.gt]: prodGetDTO.after } } : {};
    const pagOrder = [["id", `${prodGetDTO.order}`]];
    const products = await Product.findAll({
      where: pagFilter,
      order: pagOrder,
      limit: Number(prodGetDTO.limit),
    });

    res.status(200).json({
      success: true,
      message: `ACK| Successfull products get.`,
      products,
      nextCursor: products.length ? products[products.length - 1].id : null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `ERROR|\nLocation: getAllProducts controller.\nType: Internal server error:\n  ${err}`,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const reqData = req.query;
    class GetProdByCatDTO extends MasterProductsGetDTO {
      constructor(data, res) {
        super(data, res);
        this.cat = data.cat;
				this.catArray = [];
      }

      async catValid() {
        this.categorys = await Category.findAll();
        for (let cat of this.categorys) {
          this.catArray.push(cat.name);
        }

        if (!this.catArray.includes(this.cat)) {
					throw new Error('Category not found in the DB.')
        }
      }
    }
    const prodReqDTO = new GetProdByCatDTO(reqData, res);
    prodReqDTO.orderValid();
    await prodReqDTO.catValid();

    const pagFilter = prodReqDTO.after ? { id: { [Op.gt]: prodReqDTO.after }, category: prodReqDTO.cat } : { category: prodReqDTO.cat };
    const pagOrder = [["id", `${prodReqDTO.order}`]];
    const products = await Product.findAll({
      where: pagFilter,
      order: pagOrder,
      limit: Number(prodReqDTO.limit),
    });

    res.status(200).json({
      success: true,
      message: `ACK| Successfull products get.`,
      products,
      nextCursor: products.length ? products[products.length - 1].id : null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `ERROR|\nLocation: getProductsByCategory controller.\nType: Internal server error:\n  ${err}`,
    });
  }
};

const getProductsByName = async (req, res) => {
  try {
    const reqData = req.query;
    const prodGetDTO = new MasterProductsGetDTO(reqData, res);
    prodGetDTO.orderValid();
    const pagFilter =
      prodGetDTO.after && reqData.name ? { id: { [Op.gt]: prodGetDTO.after }, name: reqData.name } : {name: reqData.name};
    const pagOrder = [["id", `${prodGetDTO.order}`]];
    const products = await Product.findAll({
      where: pagFilter,
      order: pagOrder,
      limit: Number(prodGetDTO.limit),
    });

    if (products.length === 0) {
      return res.status(400).json({
        success: true,
        message: `ERROR|\nLocation: getProductByName controller.\nType: Product not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `ACK| Successfull products get.`,
      products,
      nextCursor: products.length ? products[products.length - 1].id : null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `ERROR|\nLocation: getProductsByName controller.\nType: Internal server error:\n  ${err}`,
    });
  }
};

export const addProduct = async (req, res) => {
	try {
		const addProdDTO = new AccessRequiredDTO(req, res);
		addProdDTO.verifyRoll()
		const addedProd = await Product.create(req.body);
		res.status(200).json({
			success:true,
			message: 'ACK| Product added successfully.'
		})
	}	catch (err) {
		res.status(500).json({
			success:false,
			message: `ERROR|\nLocation: addProduct controller.\nType: Internal server error:\n  ${err}`
		})
	}
}

export const updateProduct = async (req, res) => {
	try {
		const updateProdDTO = new AccessRequiredDTO(req, res);
		updateProdDTO.verifyRoll()
		const product = await Product.findByPk(updateProdDTO.id);
		if (!product) {
			return res.status(404).json({
				success:false,
				message: 'ERROR|\nLocation: updateProduct controller.\n Type: Product not found.'
			})
		}
		const updatedProd = await product.update(req.body);
		res.status(200).json({
			success:true,
			message: 'ACK| Product updated successfully.'
		})
	} catch (err) {
		res.status(500).json({
			success:false,
			message: `ERROR|\nLocation: updateProduct controller.\nType:  Internal server error:\n  ${err}`
		})
	}
}

export const deleteProduct = async (req, res) => {
	try {
		const deleteProdDTO = new AccessRequiredDTO(req, res);
		deleteProdDTO.verifyRoll()
		const product = await Product.findByPk(deleteProdDTO.id);
		if (!product) {
			return res.status(404).json({
				success:false,
				message: 'ERROR|\nLocation: updateProduct controller.\n Type: Product not found.'
			})
		}
		const deletedProd = await product.destroy();
		res.status(200).json({
			success:true,
			message: 'ACK| Product destroyed successfully from the DB.'
		})
	} catch (err) {
		res.status(500).json({
			success:false,
			message: `ERROR|\nLocation: deleteProduct controller.\nType: Internal server error:\n  ${err}`
		})
	}
}