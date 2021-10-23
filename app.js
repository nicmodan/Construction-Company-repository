const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')

/////////routers
const accountRouter = require('./controllers/account')
const userRouter = require('./controllers/user')
const profileRouter = require('./controllers/profile')
const infoRouter = require('./controllers/info')
const projectRouter = require('./controllers/projects')
/////////routers

const middware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info(`connecting to ${config.MONGODB_URL}`)
//|| 'mongodb://localhost:27017/Todoapp'

mongoose.connect(config.MONGODB_URL, 
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(()=>{
        logger.info('connected to mongoDb')
    }).catch((error)=>{
        logger.error(`error connecting to MongoDB ${error.message}`)
    })    
////// SETTING MIDEWARE CONNECTION 

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(middware.requestLogger)


// app.get('/', (request, response)=>{
//     response.status(200).send('hello world that you dont now what happing at my background')
//     console.log('localhost://3001')
// })

////// SETTING URLS ROUTERS
app.use('/api/account', accountRouter)
app.use('/api/user', userRouter)
app.use('/api/profile', profileRouter)
app.use('/api/info', infoRouter)
app.use('/api/projects', projectRouter)


////// SETTING MIDLEWARE ENDPOINTS AND ERRORS
app.use(middware.unknownEndPoint)
app.use(middware.errorHandler)

module.exports = app