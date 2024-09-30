const Listing = require("../modals/listing");
const cloudinary = require("../config/cloud");
const fs = require("fs"); // Add this line
const { Readable } = require("stream");
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req, res) => {

  const { category } = req.query;
  let filter = {};

  // If a category is provided, add it to the filter
  if (category  && category != "all") {
    filter.category = category;
  }

  // Fetch all listings based on the filter
  const allListings = await Listing.find(filter).exec();

  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
  console.log(req.body); // Check what is being received
  const listing = req.body.listing;

  // Ensure the category is valid
  if (
    !["mountain", "desert", "beach", "town", "village"].includes(
      listing.category
    )
  ) {
    throw ExpressError(400, "invalid listing");
  }

  let imageDetails;

  if (req.file) {
    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null); // Signal the end of the stream

    // Use a promise to handle the async behavior of upload_stream
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
          { folder: "wanderlust" }, // Specify the folder here
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        // Pipe the stream to Cloudinary
        stream.pipe(cloudinaryStream);
      });
    };

    // Wait for the image to be uploaded and get the URL
    const { secure_url, public_id } = await uploadToCloudinary();
    const filename = req.file.originalname;
    // Set image details from Cloudinary
    imageDetails = {
      filename: filename,
      url: secure_url,
      publicId: public_id,
    };
  }

  const newListing = new Listing(listing);
  newListing.owner = req.user._id;

  // If image details exist (user uploaded an image), set them
  if (imageDetails) {
    newListing.image = imageDetails;
  }

  console.log(newListing);
  await newListing.save();
  res.send(newListing);

  // req.flash("success", "Listing created successfully");
  // res.redirect("/listings");
};

// module.exports.createListing = async (req, res, next) => {
//   console.log("File path:", req.file.path);

//   const filePath = req.file.path;
//   try {
//     const result = await cloudinary.uploader.upload(filePath);
//     // Clean up the temporary file
//     fs.unlinkSync(filePath); // Delete the file from the server

//     const listing = req.body.listing;
//     const newListing = new Listing(listing);
//     newListing.owner = req.user._id;
//     newListing.image.url = result.secure_url;
//     await newListing.save();

//     req.flash("success", "Listing created successfully");
//     res.redirect("/listings");
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     return res.status(500).json({
//       error: "Error uploading to Cloudinary",
//       details: {
//         message: error.message,
//         statusCode: error.http_code, // if available
//         body: error.body, // if available
//       }
//     });
//   }

// };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exists");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not allowed to visit that page");
    return res.redirect(`/listings/${id}`);
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("upload", "upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  const listing = await Listing.findById(id);

  // Check if a new image is uploaded
  if (req.file) {
    // Delete the old image from Cloudinary
    if (listing.image && listing.image.publicId) {
      await cloudinary.uploader.destroy(listing.image.publicId);
    }

      // Upload the new image to Cloudinary
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);

      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const cloudinaryStream = cloudinary.uploader.upload_stream(
            { folder: "wanderlust" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.pipe(cloudinaryStream);
        });
      };

      // Wait for the new image to be uploaded and get the URL
      const { secure_url, public_id } = await uploadToCloudinary();
      const filename = req.file.originalname;

      // Update the listing's image details
      listing.image = {
        filename: filename,
        url: secure_url,
        publicId: public_id,
      };
    
  }

  Object.assign(listing, req.body.listing);  // Only update fields provided in req.body.listing
  await listing.save();
  req.flash("success", "Listing updated successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing does not exists");
    return res.redirect("/listings");
  }

  // Delete the image from Cloudinary using the stored public_id
  if (listing.image && listing.image.publicId) {
    await cloudinary.uploader.destroy(listing.image.publicId);
  }

  // Delete the listing from the database
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("error", "Listing deleted successfully");
  res.redirect("/listings");
};
