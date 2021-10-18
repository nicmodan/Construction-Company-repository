const infoRouter = require('express').Router()
const user = require('../model/account')
const info = require('../model/info')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')

// return information about comapny GET  
// edit and update iformation aboutn comapeny PUT & POST
// delete information about company  DELETE

let infoId = 0

const getTokenForm = request=>{
    const authorization = request.get('authorization')

    if((authorization && authorization.toLowerCase().startsWith('bearer '))){
        return authorization.substring(7)
    }

    return null

}

const uploadImageInfo = multer.diskStorage({
    destination: 'info',
    filename: (request, file, cb)=>{
        cb(null, file.fieldname + '_' + Date.now() + 
            path.extname(file.originalname))
    }
})

const storeImageInfo = multer({
    storage: uploadImageInfo,
    limits: {
        fileSize: 5000000
    },
    fileFilter(require, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})

infoRouter.get('/', async (request, response)=>{
    const resulte = await info.find({})//.populate('account')
    response.json(resulte)
})
infoRouter.get('/:id', async (request, response)=>{
    const num = request.params.id.substring(1)
    const resulte = await info.findOne({accounts: num}).sort({_id:-1}).limit(1);
    response.json(resulte)
})

infoRouter.post('/', async (request, reponse)=>{
    const body = request.body
    //  console.log(body)
    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if ((!token || !decodedToken.id)){
        return response.status(401).send({
            error: 'Invalid or missing token'
        })
    }
    const acc_user = await user.findById(decodedToken.id)

    const storeService = []
    for(const key of Object.keys(body.service)){
        storeService.push(body.service[key])
    }

    const newInfo = new info({
        company_name: body.name,
        company_vision: body.vision,
        company_overview: body.overview,
        company_services: storeService,
        date: new Date(),
        accounts: acc_user._id
    })

    const resulte = await newInfo.save()
    acc_user.infos = resulte._id //acc_user.infos.concat(resulte._id)
    await acc_user.save()
    // Promise.all(resulte)
    // delay untile the id of information is retrived 
    infoId = resulte._id
   
    
    return reponse.json(resulte)
})
// tage the value of the iamge inpute file as logo
infoRouter.post('/upload', storeImageInfo.single('logo'), async (req, res)=>{
    // const img = fs.readFileSync(req.file.path)
    // const encoded_img = img.toString('base64')

    const token = getTokenForm(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodedToken.id)){
        return res.status(401).send({
            error: 'invalid or missing token'
        })
    }

    const acc_user = await user.findById(decodedToken.id)

    //updateInfo.company_logo
     const logo = {
        company_logo: {
            alt: 'logo of company',
            image: {
                // contentType: req.file.mimetype,
                // data:new Buffer.alloc (5000000, encoded_img, 'base64')
                path: req.file.filename
            }
        },
        accounts: acc_user._id
    }

    const updateInfo = await info.findByIdAndUpdate(infoId, logo)

    // const resulte = await updateInfo.save()

    return res.json(updateInfo)

    // note it is targeting the token user state

    // testing is required for this face 
    // const storeLogo = info({
    //     company_logo:{
    //         alt: 'logo of company',
    //         image: {
    //             contentType: request.file.mimetype,
    //             image: new Buffer(encoded_img, 'base64')
    //         }
    //     },
    //     account: acc_user._id
    // })

    // // locate by the user id and create userimage 
    // const resulte = await storeLogo.save()
    // reponse.send(result)

})

infoRouter.put('/update/:id', async (req, res)=>{
    /////////////////////////////////////////////////////////
    // all formal note should be renders to the frontend //////////
    ////////////////////////////////////////////////////////
    const body = req.body

    const token = getTokenForm(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if ((!token || !decodedToken.id)){
        return res.status(401).send({
            error: 'invalide or Missing Token'
        })
    }
    
    const acc_user = await user.findById(decodedToken.id)
    const updateInfo = {
        Company_name: body.name,
        Company_vision: body.vision,
        comapny_overview: body.overview,
        comapny_services: body.services,
        date: new Date(),
        account: acc_user._id
    }
    const updatedInfo = await info.findByIdAndUpdate(
                        req.params.id, updateInfo, {new: true})

    acc_user.project = acc_user.project.concate(updatedInfo._id)
    acc_user.save()

    reponse.send(updatedInfo)

})

infoRouter.put('/update/logo/:id', storeImageInfo.single('logo'), async (req, res)=>{
    /////////////////////////////////////////////////////////
    // all formal note should be renders to the frontend //////////
    ////////////////////////////////////////////////////////
    const id = req.params.id
    const img = fs.readFileSync(req.file.path)
    const encoded_img = img.toString('base64')

    const token = getTokenForm(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodedToken.id)){
        return res.status(401).send({
            error: 'invalid or missing token'
        })
    }
    
    const updateLogo = {
        company_logo: {
            alt: 'Company Logo',
            image: {
                contentType: req.file.mimetype,
                image: new Buffer(encoded_img, 'base64')
            }
        },
        account: decodedToken.id
    }

    const updatedLogo = await info.findByIdAndUpdate(id, updateLogo)
    // note certain of "saving updatedLogo.save()"
    return res.json(updatedLogo)


})

module.exports = infoRouter

// .module.exports