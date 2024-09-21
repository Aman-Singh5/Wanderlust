const User = require("../modals/user");

module.exports.renderSignupForm = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already Signed up");
    return res.redirect("/listings");
  }
    res.render("users/signup.ejs");
  }

  module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
      req.flash("error", "You are already logged in");
      return res.redirect("/listings");
    }
    res.render("users/login.ejs");
  }

module.exports.signup = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({
        username: username,
        email: email,
        password: password,
      });
  
      await newUser.save();
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
  }

  module.exports.login = async (req, res) => {
    req.flash("success", `Welcome ${req.body.username}`);
    const redirectUrl = res.locals.redirectUrl ? res.locals.redirectUrl : "/listings";
    res.redirect(redirectUrl);
  }

  module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "you are logged out!");
      res.redirect("/listings");
    });
  }