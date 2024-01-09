const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLM = require('passport-local-mongoose')

const userSchema = new Schema({
    email:{
        type: String,
        required:true,
        unique:true
    }
})
userSchema.plugin(passportLM)//creates username and psw(salts and hashes) fields and adds methods to ensure its unique

module.exports = mongoose.model('User',userSchema)