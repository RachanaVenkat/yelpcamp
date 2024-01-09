const express = require('express')
const router = express.Router({mergeParams:true})//to be able able to access 'id' in the predefined rooute in app.js

const Review = require('../models/reviews')
const Campground=require('../models/campground')
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')

const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews.js')



router.post('/', isLoggedIn,validateReview,catchAsync (reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router