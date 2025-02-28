const jwt = require('jsonwebtoken')

const SECRET = process.env.AUTH_SECRET;

const signToken = (payload) => {
    return jwt.sign(payload, SECRET)
}

const verifyToken = (token) => {
    return jwt.verify(token, SECRET)
}

const decodeToken = (token) => {
    return jwt.decode(token, SECRET)
}

module.exports = { signToken, verifyToken}