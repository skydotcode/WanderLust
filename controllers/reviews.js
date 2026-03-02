const Review = require("../models/reviews.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async(req ,res)=>{
    let {id}= req.params;
    console.log(id);
    let listing = await Listing.findById(id);

    console.log(listing);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    console.log(newReview);

    await newReview.save();
    await listing.save();
    console.log("save done")

    res.redirect(`/listings/${listing.id}`);
};

module.exports.destroyReviews = async(req , res)=>{
    let {id , reviewId} = req.params;
    console.log(reviewId);
    console.log(id);
    let redirectUrl = res.locals.redirectUrl || `/listings/${id}` ;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    let deletedReview= await Review.findByIdAndDelete( reviewId );
    req.flash("success" , "Rewiew Deleted");

    console.log(deletedReview);
    
    return res.redirect(redirectUrl);
};