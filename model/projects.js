const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
// npm install mongoose-unique-validator
const projectSchema = mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    information: {
        type: String,
        required: true
    },
    sold: {
        type: Boolean,
        required: true
    },
    ratings: 'Number',
    
    date: Date,
    images: [
       {
        data: Buffer,
        contentType: String
        // path: String,
       } 
    ],
    // profile: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'profile'
    // },
    accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts'
    },
    // info: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'info'
    //     }

})

projectSchema.set('toJSON', {
    transform : (document, returndeObject)=>{
        returndeObject._id = returndeObject._id.toString()

        delete returndeObject._id
        delete returndeObject.__v
    }
})

projectSchema.plugin(uniqueValidator)

const project = mongoose.model('projects', projectSchema)
    
module.exports = project