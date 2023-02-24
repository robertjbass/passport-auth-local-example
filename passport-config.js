const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const initializePassport = (passport, getUserByEmail, getUserById) => {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (!user) return done(null, false, { message: "No user with that email" });
    //? done(error, user, {message})

    try {
      // check if the password matches the hashed password
      const match = await bcrypt.compare(password, user.password);

      if (match) return done(null, user);
      else return done(null, false, { message: "Password incorrect" });
    } catch (error) {
      return done(error);
    }
  };

  //? states that the username field is named email ?in the request body?
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  //? serializeUser and deserializeUser are used to store the user in the session

  //? user.id is the serialized user value and is used to retrieve the user from the session
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const user = getUserById(id);
    return done(null, user);
  });
};

module.exports = initializePassport;
