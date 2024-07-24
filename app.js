const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./modals/listing.js");
const path = require("path");
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connetced to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));



app.get("/", (req, res) => {
    res.send("hi iam root");
})

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

app.get("/listings/new", (req, res) => {
    res.render("listings/new");
})


app.get("/listings/:id", async(req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", {listing});
})


// create route
app.post("/listings", async(req, res) => {
    const listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.save();

    res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  });
  
  //Update Route
  app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  });
  
  //Delete Route
  app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  });

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

app.listen(8080, () => {
    console.log("server is running");
})