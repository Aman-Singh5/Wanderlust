const express = require("express");
const router = express.Router();
const Listing = require("../modals/listing.js");
const {listingSchema} = require("../schema");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");


const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.message);
    }else{
        next();
    }
}

// index route
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);


// New route
router.get("/new", (req, res) => {
    res.render("listings/new");
})


// Show route
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews");
        if(!listing){
            req.flash("error", "Listing you requested for does not exists");
            res.redirect("/listings");
        }
        res.render("listings/show", { listing });
    })
);


// create route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    req.flash('success', 'Listing created successfully');
    res.redirect("/listings");
  })
);

//Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
router.put(
    "/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash('success', 'Listing updated successfully');
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
router.delete(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash('error', 'Listing deleted successfully');
        res.redirect("/listings");
    })
);

module.exports = router;