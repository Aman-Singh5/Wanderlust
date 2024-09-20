const Listing = require("../modals/listing");
const cloudinary = require("../config/cloud");
const fs = require("fs"); // Add this line
const { Readable } = require("stream");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
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
  const stream = new Readable();
  stream.push(req.file.buffer);
  stream.push(null); // Signal the end of the stream

  // Use a promise to handle the async behavior of upload_stream
  const uploadToCloudinary = () => {
    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
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

  const listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  newListing.image = {
    filename: filename,
    url: secure_url,
    publicId: public_id,
  };

  console.log(newListing);
  await newListing.save();
  req.flash("success", "Listing created successfully");
  res.redirect("/listings");
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
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
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
