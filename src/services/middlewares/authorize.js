const jwt = require('jsonwebtoken')
const profileModel = require('../../users/schema')
const { verifyJWT } = require('../../users/authTools')

const authorize = async(req, res, next) => {
    try {
        // const token = req.cookies.token;
        const token = req.headers.authorization.replace('Bearer ', '')
        console.log('here')
        if (token) {
            const credentials = await verifyJWT(token)
            const user = await profileModel.findById(credentials._id)
            if (user) {
                req.user = user
                next()
            } else {
                res.status(404).send('Check your username/password')
            }
        }
    } catch (e) {
        console.log(e)
        const err = new Error('Please authenticatee')
        err.httpStatusCode = 401
        next(err)
    }
}

const adminOnlyMiddleware = async(req, res, next) => {
    if (req.user && req.user.role === 'admin') next()
    else {
        const err = new Error('Only for admins!')
        err.httpStatusCode = 403
        next(err)
    }
}

module.exports = { authorize, adminOnlyMiddleware }