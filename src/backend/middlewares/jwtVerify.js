import jwt, { decode, verify } from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
	const token = req.headers?.authorization?.split(' ')[1]
	if (!token) return res.status(401).json({
		success: false,
		message: "ERROR| Unauthorized access: JSON Web Token left."
	})

	try {
		const decodedToken = jwt.verify(token, process.env.JWT_KEY || 'develop_key')
		req.body.pyload = decodedToken;
		next()
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: "ERROR| Unauthorized access: Bad JSON Web Token"
		})
	}
}

export default { verifyToken }