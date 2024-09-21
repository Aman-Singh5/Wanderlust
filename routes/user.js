const express = require("express");
const router = express.Router();
const User = require("../modals/user");
const passport = require("passport");
const { redirectUrl } = require("../authMiddleware");

const userController = require("../controllers/users");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(userController.signup);

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    redirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

module.exports = router;
