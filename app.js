const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const {ensureAuthenticated} = require("./authMiddleware.js");

const session = require("express-session");
const flash = require('connect-flash');
const passport = require("passport");

// Passport configuration
require("./config/passport")(passport);
// env file
if(process.env.Node_ENV != "production") {
  require('dotenv').config();
}


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connetced to DB");
})
    .catch((err) => {
        console.log(err);
    });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);


// creating express - session
const sessionOptions = {
  secret: "mysuperpower",
  resave: false,
  saveUninitialized : false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};



app.use(session(sessionOptions));   // Initialize session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());   // Initialize flash


app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

app.get("/", ensureAuthenticated, (req, res) => {
  res.send("hi iam root");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


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
