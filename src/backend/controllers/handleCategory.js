import { Category, Product } from "../database/models.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

class AccessRequiredDTO {
    constructor(req) {
        this.req = req;
        this.id = req.params.id;
    }

    verifyRoll() {
        if (this.req.payload.roll !== 'admin') {
            throw new Error('Unauthorized.')
        }
    }
}

// Crear una categoría (solo admin)
export const addCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const addCatDTO = new AccessRequiredDTO(req);
    addCatDTO.verifyRoll();

    const { name } = req.body;

    // Verificar si existe la categoría por defecto, si no, crearla
    let defaultCategory = await Category.findOne({
        where: { isDefault: true },
        transaction
    });

    if (!defaultCategory) {
        defaultCategory = await Category.create({
            name: 'La categoría ya no existe.',
            isDefault: true
        }, { transaction });
        console.log('Categoría por defecto creada con ID:', defaultCategory.id);
    }

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({
        where: { name },
        transaction
    });

    if (existingCategory) {
        await transaction.rollback();
        return res.status(400).json({
            success: false,
            message: 'ERROR| Category already exists.'
        });
    }

    await Category.create({ 
        name,
        isDefault: false 
    }, { transaction });

    await transaction.commit();
    res.status(201).json({
        success: true,
        message: 'ACK| Category created successfully.'
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
        success: false,
        message: `ERROR| ${err.message}`
    });
  }
};

// Actualizar una categoría (solo admin)
export const updateCategory = async (req, res) => {
    try {
        const updateCatDTO = new AccessRequiredDTO(req);
        updateCatDTO.verifyRoll();

        const { name } = req.body;
        const category = await Category.findByPk(updateCatDTO.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'ERROR| Category not found.'
            });
        }

        // No permitir actualizar la categoría por defecto
        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                message: 'ERROR| Cannot update the default category.'
            });
        }

        await category.update({ name });

        res.status(200).json({
            success: true,
            message: 'ACK| Category updated successfully.'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `ERROR| ${err.message}`
        });
    }
};

// Borrar una categoría y actualizar productos (solo admin)
export const deleteCategory = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const deleteCatDTO = new AccessRequiredDTO(req);
        deleteCatDTO.verifyRoll();

        const category = await Category.findByPk(deleteCatDTO.id, { transaction });

        if (!category) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'ERROR| Category not found.'
            });
        }

        // Obtener la categoría por defecto o crearla
        let defaultCategory = await Category.findOne({
            where: { isDefault: true },
            transaction
        });

        if (!defaultCategory) {
            defaultCategory = await Category.create({
                name: 'La categoría ya no existe.',
                isDefault: true
            }, { transaction });
        }

        // No permitir borrar la categoría por defecto
        if (category.isDefault) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'ERROR| Cannot delete the default category.'
            });
        }

        // Actualizar todos los productos que usan esta categoría
        await Product.update(
            { category: defaultCategory.id },
            { 
                where: { category: deleteCatDTO.id },
                transaction
            }
        );

        await category.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'ACK| Category deleted successfully and products updated.'
        });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: `ERROR| ${err.message}`
        });
    }
};

// Obtener todas las categorías (público)
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                isDefault: false // Excluir la categoría por defecto
            },
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'ACK| Categories retrieved successfully.',
            categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `ERROR| ${err.message}`
        });
    }
};
