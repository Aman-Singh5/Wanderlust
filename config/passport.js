const LocalStrategy = require("passport-local").Strategy;
const User = require("../modals/user");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Username is incorrect" });
        }

        // check if the passowrd is correct
        const verify = await user.comparePassword(password);
        if (!verify) {
          return done(null, false, { message: "Password is incorrect" });
        }

        // if everything is fine, return user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

    // Serializing and deserializing user
    passport.serializeUser((user, done) => {
        done(null, user._id);
      });
    
      passport.deserializeUser(async (id, done) => {
        try {
          const user = await User.findById(id);
          done(null, user);
        } catch (err) {
          done(err);
        }
      });
};
