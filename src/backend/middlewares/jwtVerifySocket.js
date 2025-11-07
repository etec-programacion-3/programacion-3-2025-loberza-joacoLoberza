import jwt from 'jsonwebtoken'

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (!token) return next(new Error("ERROR| Unauthorized access: JSON Web Token left."))

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY || 'develop_key')
    console.log(decodedToken) //DEV LINE - TEMPORAL
    socket.payload = decodedToken;
    next()
  } catch (err) {
    return next(new Error("ERROR| Unauthorized access: Bad JSON Web Token"))
  }
}

export default verifyTokenSocket