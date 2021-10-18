const account = require('../model/account')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const accountRoiuter = require('express').Router()

accountRoiuter.get('/', async (request, response)=>{
    const res = await account.find({})//.populate("profiles")
    response.json(res)
})

// accountRoiuter.get('/:id', async (request, response)=>{
//     const id = request.params.id
//     const user = account.findById({id}) 
// })

accountRoiuter.post('/', async (request, response)=>{

    ///////////////////////////////////////////////////////////////////
    /////////// IF CREATED ACCOUNT TOKEN SHOULD BE CREATED FROM HERE
    ///////////////////////////////////////////////////////////////////

    const body = request.body
    // console.log(body)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    console.log(passwordHash, body)

    const acc = new account({
        firstName: body.firstName,
        lastName: body.lastName,
        passwordHash: passwordHash,
        username: body.username,
        email: body.email,
        phoneNumber: body.phoneNumber,
        date: new Date()
    }) 

    const result = await acc.save()

    const userToken = {
        username: result.username,
        id: result._id
    }
    const token = jwt.sign(userToken, 
                            process.env.SECRET,
                            {expiresIn: 60*06})

    response.json({token,
                    username: result.username,
                    id: result._id})

    // Promise.all(passwordHash)
})

module.exports = accountRoiuter