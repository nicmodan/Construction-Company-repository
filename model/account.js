const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const accountSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3
    },
    passwordHash: {
        type: String,
        required: true,
        minLength: 3
    },
    username: {
        type: String,
        required: true,
        minLength: 3
    },
    email: {
        type: String,
        minLength: 3
    },
    phoneNumber: {
        type: String,
        minLength: 3
    },
    date: Date,
    profiles: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profiles' 
    },
    infos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'infos' 
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects' 
    }]
})

accountSchema.plugin(uniqueValidator)

accountSchema.set('toJSON', {
    transforms: (documents, returndeObjects)=>{
        returndeObjects._id = returndeObjects._id.toString()

        delete returndeObjects._id
        delete returndeObjects.__v

        delete returndeObjects.passwordHash
    }
})

const account = mongoose.model('accounts', accountSchema)

module.exports = account

