const config = require('../utils/config')
const projectRouter = require('express').Router()
const project = require('../model/projects')
const account = require('../model/account')
const jwt = require('jsonwebtoken')
//const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadProjectImg = multer.diskStorage({
    destination: `projects`,
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '_' + Date.now() +
            path.extname(file.originalname))
    }
})
// const uploadProjectImg = new GridFsStorage({
//     url: config.MONGODB_URL,
//     file: (req, file)=>{
//         return new Promise((resolve, reject)=>{
//             crypto.randomBytes(16, (err, buf)=>{
//                 if (err){
//                     return reject(err)
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.originalname)
//                 const fileInfo = {
//                     filename: filename,
//                     buketName: 'uploads'
//                 }
//                 resolve(fileInfo)
//             })
//         })
//     }
// })
const storeProjectImg = multer({
    storage: uploadProjectImg,
    limits: {
        fileSize: 5000000
    },
    fileFilter(request, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpng|JPG)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})

const getTokenForm = request =>{
    const authorization = request.get('authorization') 

    if ((authorization && authorization.toLowerCase().startsWith('bearer '))){
        return authorization.substring(7)
    }
    return null
}

projectRouter.get('/', async (request, response)=>{
    const prj = await project.find({})//.populate('account')
    response.json(prj)
})

projectRouter.get('/:id', async (request, response)=>{
    // note required 
    // const id = request.params.id
    // const token = getTokenForm(request)
    // const decodedToken = jwt.verify(token, process.env.SECRET)

    // if(!token || !decodedToken.id){
    //     return response.status(401).send({
    //         error: 'Missing or Invalide token'
    //     })
    // }
    const num = request.params.id.substring(1)
    const resulte = await project.find({accounts: num}).maxTimeMS(100);//.sort({_id:-1}).limit(1);
    response.json(resulte)
    // const prj = await project.findById(id)
    // response.json(prj)

})
let projectId = 0
projectRouter.post('/', async (request, response)=>{
    // console.log(request.body)
    const {location, information, ratings} = request.body
    const token = getTokenForm(request)
    const decodeToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodeToken)){
        return response.status(401).send({error: 'Token Invalid or missing'})
    }

    const user = await account.findById(decodeToken.id)

    const prj = new project({
        location,
        information: information,
        sold: true, // THIS SHOULD BE TRUE BY DEFULTE 
        ratings: ratings,
        date: new Date(),
        accounts: user._id
    })

    const savedPrj = await prj.save()
    user.projects = [...user.projects, savedPrj._id]
    await user.save()

    // Promise.all(savedPrj)
    // delay untill the id of projetec is retrived
    projectId = savedPrj._id
    
    response.json(savedPrj)
})

projectRouter.post('/upload', storeProjectImg.array('image', 4), async (request, response)=>{
    // console.log(request.files)
    const requestFile = []
    // const img = fs.readFileSync(request.files.path)
    // const encoded_img = img.toString('base64')
    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if(!token || !decodedToken.id){
        return response.status(401).send({
            error: 'token Invalid of missing'
        })
    }
    //
    const user = await account.findById(decodedToken.id)
    
    for(let i = 0; i<request.files.length; i++){

        const img = fs.readFileSync(request.files[i].path)
        const encoded_img = img.toString('base64')
        const obj = {   
            // filename: request.files[i].filename,
            // fileId: request.files[i].id
            contentType: request.files[i].mimetype,
            data: img //new  Buffer.alloc(5000000, encoded_img, 'base64') 
        }
        requestFile.push(obj)

        // requestFile.push({path: request.files[i].filename})
    }

    const prjImg = {
        images: requestFile,
        accounts: user._id
    }

    const prj = await project.findByIdAndUpdate(projectId, prjImg)

    // prj.image = prj.image.push(prjImg)
    // const savedPrjImg = await prj.save()

// testing is required for this face

//    const prjImg = {
//        contentType: request.file.mimetype,
//        image: new Buffer(encoded_img, 'base64') 
//    }
//    const prj = project.image.push(prjImg)
//    const savedPrjImg = await prj.save()

//  please correct this 

    response.json(prj)
    

})

projectRouter.put('/update/:id', async (request, response)=>{
    const id = request.params.id
    const {location, inforamtion, ratings} = request.body
    const token = getTokenForm(request)
    const decodeToken = jwt.verify(token, process.env.SECRET)

    if((!token || !decodeToken._id)){
        return response.status(401).send({
            error: 'Invalid or Missing Token'
        })
    }

    const updatePrj = {
        location,
        inforamtion,
        sold: true,
        ratings,
        data: new Date(),
        account: decodeToken._id
    }
    const resulte = await project.findByIdAndUpdate(id, updatePrj, {new: true})
    response.json(resulte)
})

projectRouter.put('/updata/upload/:id', storeProjectImg.array('image', 4) ,async (request, response)=>{
    const id = request.params.id
    const newImg = fs.readFileSync(request.file.path)
    const encoded_img = newImg.toString('base64')

    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.end.SECRET)

    if ((!token || decodedToken.id)){
        return response.status(401).send({
            error: 'Invalid or Missing Token'
        })
    }

    const user = account.findById(decodedToken.id)
    
    const updatePrjImg = {
        images: [
            {
                contentType: req.file.mimetype,
                image: new Buffer(encoded_img, 'base64')
            }
        ],
        account: user._id
    }
    const updatedPrj = await project.findByIdAndUpdate(
        id, updatePrjImg
    )
    response.send(updatedPrj)

})

projectRouter.delete('/delete/:id', async (request, response)=>{
    const id = request.params.id
    const token = getTokenForm(request)
    const decodedToken = jwt.verify(token, process.env.SECRES)

    if((!token || !decodedToken)){
        return response.status(401).send({
            error: 'Invalid or Missing Token'
        })
    }
    
    const deletePrj = await project.findByIdAndRemove(id,)
    response.status(204).send(deletePrj)
})

module.exports = projectRouter

// .module.exports