const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerationSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Phone: {
        type: Number,
        required: true
    },
    Age: {
        type: Number,
        required: true
    },
    Gender: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    ConfirmPassword: {
        type: String,
        required: true
    },
    Tokens: [{
        Token: {
            type: String,
            required: true
        }
    }]
})

registerationSchema.methods.generateToken = async function(){
    try{
        const id = this._id
        const token = await jwt.sign({_id:id},process.env.KEY)
        this.Tokens = this.Tokens.concat({Token:token})
        await this.save()
        return token
    }
    catch(err){
        return err.message
    }
}

registerationSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {
        this.Password = await bcryptjs.hash(this.Password, 10)
        this.ConfirmPassword = await bcryptjs.hash(this.Password, 10)
    }
    next()
})

const userRegisterationData = new mongoose.model('userRegisterationData', registerationSchema)

module.exports = userRegisterationData