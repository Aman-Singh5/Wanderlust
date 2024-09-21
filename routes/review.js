const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../modals/review.js");
const Listing = require("../modals/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const {ensureAuthenticated, isReviewAuthor} = require("../authMiddleware.js");

const reviewController = require("../controllers/reviews.js");


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.message);
    }else{
        next();
    }
}

// reviews post route
router.post("/", ensureAuthenticated, validateReview, wrapAsync(reviewController.createReview));

// review delete route
router.delete("/:reviewId", ensureAuthenticated, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;