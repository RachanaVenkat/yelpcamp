const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')

const User = require('../models/user')
const passport = require('passport')
const { storeReturnTo,isLoggedIn } = require('../middleware')
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
                  //builtin middleware by passport
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}),users.login)

router.get('/logout', users.logout); 

module.exports = router