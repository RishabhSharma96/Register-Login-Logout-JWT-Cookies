const jwt = require("jsonwebtoken")
const userRegisterationData = require('./registerSchema.js')

const auth = async (req,res,next) => {
    try{
        const tokenValue = req.cookies.jwtToken
        const verifyUser = jwt.verify(tokenValue,process.env.KEY)
        const user = await userRegisterationData.findOne({_id:verifyUser._id})

        req.Token = tokenValue
        req.user = user

        next()

    }
    catch(err){
        res.send(err.messgae)
    }
}

module.exports = auth