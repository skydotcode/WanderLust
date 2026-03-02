const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require ("../utils/wrapAsync.js");
const ExpressError = require ("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listings.js");

const listings = require("../routes/listings.js");
const review = require("../routes/review.js");

const {isLoggedIn , isAuthor, isOwner, isReviewAuthor} = require("../middleware.js");

const reviewControllers = require("../controllers/reviews.js");

const validateReview=(req,res,next)=>{
    let{error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
}

//review
//POST Route
router.post("/" ,validateReview,isLoggedIn, wrapAsync(reviewControllers.createReview));

//destroy route
router.delete("/:reviewId" ,isLoggedIn ,isReviewAuthor, wrapAsync(reviewControllers.destroyReviews));

module.exports = router;