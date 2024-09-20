const express = require("express");
const router = express.Router();
const Listing = require("../modals/listing.js");
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { ensureAuthenticated, isOwner } = require("../authMiddleware.js");

const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const listingController = require("../controllers/listings.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.message);
  } else {
    next();
  }
};

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    ensureAuthenticated,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New route
router.get("/new", ensureAuthenticated, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    ensureAuthenticated,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    ensureAuthenticated,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

//Edit Route
router.get(
  "/:id/edit",
  ensureAuthenticated,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
