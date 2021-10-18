const profileRouter = require('express').Router()
const profile = require('../model/profile')
const user = require('../model/account')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

let profileId = 0

const getTokenForm = request =>{
    const authorization = request.get('authorization')

    if((authorization && authorization.toLowerCase().startsWith('bearer '))){
        return authorization.substring(7)
    }

    return null 
}

const UploadImageInfo = multer.diskStorage({
    destination: 'profile',
    filename: (request, file, cb)=>{
        cb(null, file.fieldname + '_' + Date.now() + 
            path.extname(file.originalname))
    }
})

const storeImageInfo = multer({
    storage: UploadImageInfo,
    limits: {
        fileSize: 10000000
    },
    fileFilter(request, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpng|JPG)$/)){
            return cb(new Error('please uplaod an image'))
        }
        cb(undefined, true)
    }
})

profileRouter.get('/', async (request, response)=>{
    const resulte = await profile.find({})//.populate('account)
    response.send(resulte)
})
profileRouter.get('/:id', async (request, response)=>{
    const num = request.params.id.substring(1)
    //const resulte = await profile.find({})//.populate('account)
    const resulte = await profile.findOne({accounts: num}).sort({_id:-1}).limit(1);
    response.json(resulte)
})

profileRouter.post('/', async (request, response)=>{
    const body = request.body
    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if ((!token || !decodedToken.id)){
        return response.status(401).send({
            error: "Invalid or Missing Token"
        })
    }
    const userInfo = await user.findById(decodedToken.id)

    const newProfile = new profile({
        names: body.name,
        SelfIntorduction: body.SelfIntorduction,
        contactInformation: {
            phoneNumber: userInfo.phoneNumber,
            email: userInfo.email,
            socialLinks: {
                faceBook: body.faceBook || null,
                twitter: body.twitter || null,
                whatsApp: body.whatsApp || null,
                otherSocials: body.otherSocials || null
            },
            location: body.location
        },
        data: new Date(),
        accounts: userInfo._id
    })

    const resulte = await newProfile.save()
    userInfo.profiles = resulte._id //userInfo.profile.concat(resulte._id)
    await userInfo.save()
    profileId = resulte._id
    response.send(resulte)

})

// tage the value of the iamge inpute file as logo
profileRouter.post('/upload', storeImageInfo.array('image', 4) ,async (request, response)=>{
    // const img = fs.readFileSync(request.file.path)
    // const encoded_img = img.toString('base64')

    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodedToken.id)){
        return response.status(401).send({
            error: 'Invalid or missing token'
        })
    }

    const requestFiles = []
    for(let i = 0; i<request.files.length; i++){
        
        // let img = fs.readFileSync(request.files[i].path)
        // let encoded_img = img.toString('base64')
        // const imgObj = {
        //     contentType: request.files[i].mimetype,
        //     data: new  Buffer.alloc(5000000, encoded_img, 'base64')
        // }
        // requestFiles.push(imgObj)
        requestFiles.push({path: request.files[i].filename})
    }

    console.log(request.files)

    // this is unesseray for now 
    // i think a maper should be used 
    const userInfo = await user.findById(decodedToken.id)

    // const imgObj = {
    //     contentType: request.file.mimetype,
    //     data: new Buffer(encoded_img, 'base64')
    // }
    const images = {
        image: requestFiles,
        accounts: userInfo._id
    }
    const profileInfo = await profile.findByIdAndUpdate(profileId, images)
    response.json(profileInfo)

})


profileRouter.put('/update/:id', async (request, response)=>{
    const body = request.body
    const id = request.params.id

    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    
    if((!token || !decodedToken.id)){
        return response.status(401).send({
            error: 'Invalid or Missing Token'
        })
    }
    const userInfo = user.findById(decodedToken.id)
    /////////////////////////////////////////////////////////
    // all formal note should be renders to the frontend //////////
    ////////////////////////////////////////////////////////
    const updateProfile = {
        name: body.name,
        SelfIntorduction: body.SelfIntorduction,
        contactInformation: {
            phoneNumber: userInfo.phoneNumber || body.number,
            email: userInfo.email || body.email,
            socialLinks: {
                faceBook: body.faceBook || null,
                twitter: body.twitter || null,
                whatsApp: body.whatsApp || null,
                otherSocials: body.otherSocials || null
            },
            location: body.location
        },
        data: new Date(),
        account: userInfo._id
    }
    const newProfile = await profile.findByIdAndUpdate(id, updateProfile, {new: true})
    //profileId = newProfile._id
    response.json(newProfile)

})

profileRouter.put('/update/upload/:id', storeImageInfo.array('image', 4), async (request, response)=>{
    const id = request.params.id
    const img = fs.readFileSync(request.file.path)
    const encoded_img = img.toString('base64')

    const token = getTokenForm(request)
    const decodeToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodeToken)) return response.status(401).send({error: 'Invalid or Missing Token'})
    /////////////////////////////////////////////////////////
    // all formal note should be renders to the frontend //////////
    ////////////////////////////////////////////////////////
    const updateImages = {
        contentType: request.file.mimetype,
        image: new Buffer(encoded_img, 'base64')
    }

    const newUpdateImg = await profile.findByIdAndUpdate(
        id,
        {
            image: [updateImages],
        }
    )
    response.json(newUpdateImg)
})


module.exports = profileRouter


