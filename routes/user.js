const express = require("express");
const router = express.Router();
const User = require("../modals/user");
const passport = require("passport");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({
      username: username,
      email: email,
      password: password,
    });

    const registeredUser = await newUser.save();
    req.flash("success", "Signed up successfully");
    res.redirect("/login");
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyValue.username) {
        req.flash("error", "Username already exists");
        res.redirect("/signup");
        // next(new ExpressError(400, "Username already exists!"));
      } else if (err.keyValue.email) {
        req.flash("error", "Email already exists");
        res.redirect("/signup");
        // next(new ExpressError(400, "email already exists!"));
      }
    } else {
      // Handle other errors
      next(err);
    }
  }
});

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", `Welcome ${req.body.username}`);
    res.redirect("/listings");
  }
);

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
