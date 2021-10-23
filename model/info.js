const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
    company_logo: {
        alt: String,
        image: {
            data: Buffer,
            contentType: String
            // path: String
        }
    },
    company_name: {
        type: String,
        minLength: 3,
        required: true 
    },
    company_vision: {
        type: String,
        minLength: 3,
        required: true
    },

    company_overview: {
        type: String,
        minLength: 3,
        required: true
    },
    // 
    company_services: {type: Array},

    date: Date,
    // projects: [{
    //     type: mongoose.Schema.Types.objectId,
    //     ref: 'projects'
    // }],
    accounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts'
    },
    // profile: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'profile'
    // }

})

companySchema.set('toJSON', {
    transform: (document, returndeObject)=>{
        returndeObject._id = returndeObject._id.toString()
        delete returndeObject._id
        delete returndeObject.__v
    }
})

const info = mongoose.model('info', companySchema)

module.exports = info