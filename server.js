require('dotenv').config()
require('./conn.js')
const express = require('express')
const { statSync } = require('fs')
const hbs = require('hbs')
const mongoose = require('mongoose')
const path = require('path')
const userRegisterationData = require('./registerSchema.js')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const auth = require('./auth.js')

const server = express()

server.use(express.static(path.join(__dirname)))
server.use(cookieParser())
server.set('view engine', "hbs")

server.use(express.urlencoded({ extended: false }))

server.get('/', (req, res) => {
    res.render('./index.hbs',{ toBeDone:"login" })
})

server.get('/registeration', (req, res) => {
    res.render('./registeration.hbs')
})

server.get('/login', (req, res) => {
    res.render('login')
})

server.get('/secret', auth, (req, res) => {
    res.render('./secret.hbs')
})

server.get('/logout', auth, async (req, res) => {
    try{
        //for single device logout
        // req.user.Tokens = req.user.Tokens.filter((element)=>{
        //     return element.Token != req.Token
        // })

        //for logout of all devices
        req.user.Tokens = []


        res.clearCookie('jwtToken')
        await req.user.save()
        res.render('./index.hbs',{ toBeDone:"login" })
    }
    catch(e){
        res.send(e.message)
    }
})

server.post('/registeration', async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.cpassword

        if (password === cpassword) {
            const user = new userRegisterationData({
                FirstName: req.body.fname,
                LastName: req.body.lname,
                Email: req.body.email,
                Phone: req.body.pnumber,
                Age: req.body.age,
                Gender: req.body.gender,
                Password: req.body.password,
                ConfirmPassword: req.body.cpassword
            })

            const token = await user.generateToken()

            res.cookie("jwtToken",token,{
                expires: new Date(Date.now() + 180000),
                httpOnly:true
            })

            await user.save()
            res.status(201).render("./login.hbs")
        }
        else {
            res.send("Password not match")
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})

server.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const dataofEmail = await userRegisterationData.findOne({ Email: email })
        const hashPassword = dataofEmail.Password

        const isMatch = await bcryptjs.compare(password, hashPassword)

        const token = await dataofEmail.generateToken()

        const cookie = await res.cookie("jwtToken",token,{
            expires: new Date(Date.now() + 180000),
            httpOnly:true
        })

        if (isMatch) {
            res.status(201).render("./index.hbs",{ toBeDone:"logout" })
        }
        else {
            res.status(400).send('Invalid Credentials')
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})


server.listen(5000, () => {
    console.log(`server is listening at port 5000`);
})