import { User } from '../database/models.js'
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
          const token = jwt.sign({ user: user.name, roll: user.roll, email: user.email }, process.env.JWT_KEY || 'develop_key');
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
  try {
    const newUser = await User.create(req.body)
    res.status(200).josn({
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