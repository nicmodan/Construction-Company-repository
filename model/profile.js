const mongoose = require('mongoose')

const profileSchema = mongoose.Schema({
    names: {
        type: String,
        minLength: 3,
        required: true
    },
    SelfIntorduction: {
        type: String,
        maxLength: 1000,
        required: true
    },
    image:
        [{
            data: Buffer,
            contentType: String
            // path: String
    }],

    
    contactInformation: {
        phoneNumber: {
            type: String,
            maxLength: 15,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        socialLinks: {
            type: Map,
            of: String 
        },
        location: {
            type: String,
            required: true
        },
       
        // info: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'info'
        // }
    },
    date: Date,
    // projects: [{
    //     type: mongoose.Schema.Types.objectId,
    //     ref: 'projects'
    // }],
    accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts'
    }
    
    
})
// validation for mongodb data base is required 

profileSchema.set('toJSON', {
    transforms: (document, returndeObjects)=>{
        returndeObjects._id = returndeObjects._id.toString()

        delete returndeObjects._id
        delete returndeObjects.__v
    }
})

const profile = mongoose.model('profile', profileSchema)

module.exports = profile