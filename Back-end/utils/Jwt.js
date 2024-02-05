import jwt from "jsonwebtoken"
import dotend from "dotenv"
dotend.config()

const secret = `${process.env.JWT_SECRET}` || 'secretKey'

export const generateToken = (user) => {
    return jwt.sign(
        {
            id : user._id ,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        },
        secret,
        { expiresIn: "24h" }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, secret)
}