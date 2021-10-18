const logger = require('./logger')

const requestLogger =(request, response, next)=>{
    logger.info(`Methode:  ${request.method}`)
    logger.info(`Path:  ${request.path}`)
    logger.info(`Body:  ${request.body}`)
    logger.info(`---`)
    next()
}

const unknownEndPoint =(request, response)=>{
    response.status(404).send({error: 'Unknown Endpoint'})
    // ##################################
    // this response should later send the user to another dirctory or webpage
}

const errorHandler =(error, request, response, next)=>{
    logger.error(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformated Id'})

    }else if(error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})

    }else if(error.name === 'JsonWebTokenError'){
        return response.status(401).json({
            error: 'Invalid token'
        })
    }else if(error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })

    }else if(error.name === 'TypeError'){
        return response.status(400).json({
            error: 'error'
        })
    }
    // else if(error.name === 'Invalid schema configuration'){
    //     return response.status(400).json({
    //         error: error.message
    //     })
    // }
    //Invalid schema configuration

    next(error)
}


module.exports = {
    requestLogger,
    unknownEndPoint,
    errorHandler
}