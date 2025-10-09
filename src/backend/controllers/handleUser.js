import { User } from '../database/models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const userLogin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (name && email && password) {
      const User = await User.findOne({
        where: {name: name}
      });

      if (User) {
        const validPass = await bcrypt.compare(password, User.password);
        
        if (email === User.email) {
          const validEmail = true;
        } else {
          const validEmail = false;
        }

        if (validPass && validEmail) {
          const token = jwt.sign({user:User.name, roll:User.roll, email:User.email}, process.env.JWT_KEY || 'develop_key');
          res.status(200).json({
            success: true,
            message: "Successfull login.",
            token: token
          })
        }
      } else {
        res.status(404).json({
          message:"ERROR| Request not solved: user name doesn't exist.",
          success: false
        })
      }
    } else {
      res.status(400).json({
        message:"ERROR| Incomplete request: left required fields.",
        success:flase
      })
    }
  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error:\n  ${err}`
    })
  }
}

export const userRegister = async (req, res) => {
  try {
    const newUser = await User.create(req.body)
    res.status(200).josn({
      success:true,
      message:"Successfull register."
    })
  } catch (err) {
    res.status(500).json({
      success:false,
      message:`ERROR| Can't register the user:\n  ${err}`
    })
  }
}