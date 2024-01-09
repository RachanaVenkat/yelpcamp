const Review = require('../models/reviews')
const Campground=require('../models/campground')

module.exports.createReview = async(req,res)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)//review cuz in show.ejs, name=review[of everything grouped under]
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success','Successfully created new review')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}})//to remove from mongo array
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','Successfully deleted a review')
    res.redirect(`/campgrounds/${id}`)
}