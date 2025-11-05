import sequelize from "../config/database"
import mercadopago from "mercadopago";
import { CartItem, Order, OrderItem, Product } from "../database/models";

const mercadopagoWebhook = async (req, res) => {
  const transaction = sequelize.transaction()
  try {
    const { type, data } = req.body;
    const userId = req.payload.id;
    const payment = await mercadopago.payment.findById(data.id)

    if (!payment) {
      transaction.rollback()
      return res.status(424).json({
        success:false,
        message: `ERROR| Payment doesn't exist or isn't found.`
      })
    }

    const orderId = payment.external_reference;
    const { status } = payment;

    const order = await Order.findOne({
      include: [ OrderItem ],
      where : { id : orderId },
      transaction
    })

    if (!order) {
      transaction.rollback()
      return res.status(410).json({
        success:false,
        mesage: `ERROR| Order no longer exist.`
      })
    }

    if (status === 'approved') {
      await order.update({
        status:'paid',
        paymentId: data.id,
        paidAt: new Date()
      }, { transaction })

      for (let item of order.OrderItems) {
        await Product.decrement('stock', {
          by: item.amount,
          where: { id: item.product },
          transaction
        });
      }

      const itemsToDestroy = await CartItem.findAll({
        include: [
          {
            model: Cart,
            attributes: [],
            where: { user : userId },
            required: true
          },
          {
            model: Product,
            attributes: ['name']
          }
        ],
        transaction
      })

      if (itemsToDestroy) {
        const orderItems = (await OrderItem.findAll({
          where: { order : orderId },
          attributes: [],
          include: {
            model: Product,
            attributes:['name']
          }
        }))?.map( name => {
          name = name.Product.name
        }) ;
        for ( orderItem of orderItems ) {
          for ( cartItem of itemsToDestroy ) {
            if ( orderItem === cartItem.Product.name) {
              await itemsToDestroy.destroy({}, { transaction })
            }
          }
        } 
      }
    } else if (status === 'rejected' || status === 'cancelled') {
        await order.update({
          status: 'failed',
          paymentId: data.id
        }, { transaction });
    }
    //Hacer commit y mandar respuesta.
  } catch(err) {

  } 
}

export default mercadopagoWebhook