import { User, Cart, CartItem } from '../database/models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const userLogin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (name && email && password) {
      const user = await User.findOne({
        where: { name: name }
      });

      if (user) {
        const validPass = await bcrypt.compare(password, user.password);

        const validEmail = (email === user.email);

        if (validPass && validEmail) {
          const token = jwt.sign({ user: user.name, roll: user.roll, email: user.email, id: user.id }, process.env.JWT_KEY || 'develop_key');
          res.status(200).json({
            success: true,
            message: "ACK| Successfull login.",
            token: token
          })
        } else {
          res.status(401).json({
            success: false,
            message: "ERROR|\nLocation: userLogin controller.\nUnauthorized access: Invalid credentials."
          })
        }
      } else {
        return res.status(404).json({
          message: "ERROR|\nLocation: userLogin controller.\nRequest not solved: User name doesn't exist.",
          success: false
        })
      }
    } else {
      return res.status(400).json({
        message: "ERROR|\nLocation: userLogin controller.\nIncomplete request: left required fields.",
        success: flase
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `ERROR|\nLocation: userLogin controller.\nInternal server error:\n  ${err}`
    })
  }
}

export const userRegister = async (req, res) => {
  /*
    Expexted body:
      name:string,
      email:string,
      password:string,
      roll:string,
      dni:string,
      home:string,
  */
  try {
    const newUser = await User.create(req.body)
    const newCart = await Cart.create({
      user: newUser.id
    })
    res.status(201).json({
      success: true,
      message: "ACK| Successfull register."
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `ERROR|\nLocation: userRegister controller.\nCan't register the user:\n  ${err}`
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.payload.id;

    const user = await User.findOne({ where : { id: userId } })
    const cart = await Cart.findOne({ where : { user : id } })
    const cartItems = await CartItem.findOne({ where : { cart : Cart.id } })

    if (!user || !cart) {
      return res.status(404).json({
        success:false,
        message: `ERROR: Resourses not found, couldn't delete.`
      })
    }

    if (cartItems) {const oldCartItems = await cartItems.destroy();}
    const oldCart = await cart.destroy();
    const oldUser = await user.destroy();

    res.status(200).json({
      success: true,
      message: 'ACK| User deleted successfully.'
    })
  } catch (err) {
    res.status(500).json({
      success: true,
      message: 'ERROR| Internal server error.'
    })
  }
}
//Temporal controller
export const getUser = async (req, res) => {
  const users  = await User.findAll();
  res.status(200).json({
    users,
  })
}