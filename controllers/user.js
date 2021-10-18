const account = require('../model/account')
const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// const getTokenForm = null

userRouter.post('/', async (request, response)=>{
    ///////////////////////////////////////////////////////////////////
    /////////// IF CREATED ACCOUNT TOKEN SHOULD BE CREATED FROM HERE
    ///////////////////////////////////////////////////////////////////
    
    const body = request.body

    const user = await account
        .findOne({username: body.username})

    const passwordCorrect = user === null
        ? false 
        : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)){
        return response.status(401).json(
            {error: 'Invalid userName or password'}
        )
    }

    const usertoken = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(usertoken, 
                           process.env.SECRET,
                           {expiresIn: 60*60})
                         // put timer limite on token)

    response.status(200).send({token, 
        username: user.username, id: user._id})
        // password: body.password, hashpassword: user.passwordHash,
        // compared: passwordCorrect})

})

userRouter.get('/', async (request, response)=>{
    const users = await account.find({})
        // .populate(['profile', 'info', 'projects'])
            
    response.json(users)
    
})

module.exports = userRouter