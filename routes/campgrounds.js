const express = require('express')
const router = express.Router()
const campgrounds = require('../controllers/campgrounds')

const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

const catchAsync = require('../utils/catchAsync')
const Campground=require('../models/campground')
const {isLoggedIn,isAuthor,validateCampground,storeReturnTo} = require('../middleware')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
    

//ORDER MATTERS HERE
router.get('/new',isLoggedIn,campgrounds.renderNewForm)
//WHEN ITS AFTER THE FINDBYID,IT TREATS "NEW" AS AN ID AND THROWS ERROR SINCE IT DOESN'T EXIST


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor, upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))





module.exports = router