const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./modals/listing.js");
const path = require("path");
const methodOverride = require("method-override");
<<<<<<< HEAD
const wrapAsync = require("./utils/wrapAsync.js");
const EpressError = require("./utils/ExpressError.js");
const ExpressError = require("./utils/ExpressError.js");
=======
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingSchema = require("./schema.js");
>>>>>>> e24ecb763bca4df9935ae423778be37ac160b343

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connetced to DB");
<<<<<<< HEAD
  })
  .catch((err) => {
    console.log(err);
  });
=======
})
    .catch((err) => {
        console.log(err);
    });
>>>>>>> e24ecb763bca4df9935ae423778be37ac160b343

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
  res.send("hi iam root");
});

<<<<<<< HEAD
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
  })
);

// create route
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    if (!(req.body.listing)) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
=======
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error.message);
    }else{
        next();
    }
}

app.get(
    "/listings",
    wrapAsync(async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    })
);


app.get("/listings/new", (req, res) => {
    res.render("listings/new");
})


app.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show", { listing });
    })
);


// create route
app.post(
    "/listings",
    validateListing,
    wrapAsync(async (req, res) => {
        const listing = req.body.listing;
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Update Route
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
    })
>>>>>>> e24ecb763bca4df9935ae423778be37ac160b343
);

// app.get("/testListing", async (req, res) => {cls
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Goa",
//         country: "india"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("secufully saved");
// })
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something is wrong" } = err;
  res.status(statusCode).send(message);
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something is wrong" } = err;
    res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is running");
});
