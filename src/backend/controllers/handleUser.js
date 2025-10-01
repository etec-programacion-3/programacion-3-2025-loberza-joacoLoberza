import { User } from '../database/models.js'
import { bcrypt } from 'bcrypt'
import {  }

export const userLogin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (name, email, password) {
      const User = await User.findOne({
        where: {name: name}
      })

      if (User) {
        const validPass = await bcrypt.compare(password, User.password)
        
        if (email === User.email) {
          const validEmail = true;
        } else {
          const validEmail = false;
        }

        if (validPass && validEmail) {
          res.status(200).json({
            success: true,
            message: "Successfull login.",
            token: "Vemos después como se hace xd" // <---- SEGUIR ACÁ
          })
        }

      } else {
        res.status(404).json({
          message:"Request not solved: user name doesn't exist.",
          success: false
        })
      }
    }
  }
}