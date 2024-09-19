const Listing = require("./modals/listing");
const Review = require("./modals/review.js");

module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.redirectUrl = req.originalUrl;
  req.flash("error", "you must be logged in");
  res.redirect("/login");
};

module.exports.redirectUrl = (req, res, next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl =  req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req, res, next) => {
  const {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error", "You are not a post owner!");
      return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error", "You are not a review owner!");
      return res.redirect(`/listings/${id}`);
  }
  next();
}