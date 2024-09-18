const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../modals/review.js");
const Listing = require("../modals/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const {ensureAuthenticated} = require("../authMiddleware.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.message);
    }else{
        next();
    }
}

// reviews post route
router.post("/", ensureAuthenticated, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save(); 
    req.flash('success', 'Review added successfully');
    res.redirect(`/listings/${listing._id}`);
}));

// review delete route
router.delete("/:reviewId", ensureAuthenticated, wrapAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('error', 'Review deleted successfully');
    res.redirect(`/listings/${id}`)
}));

module.exports = router;