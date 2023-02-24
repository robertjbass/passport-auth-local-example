const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const { initializeDB, getUsers, addUser, getUserById, getUserByEmail } = require("./db.js");
//? express-flash is used by passport to display flash messages for errors
const flash = require("express-flash");
const session = require("express-session");
const dotenv = require("dotenv");
const methodOverride = require("method-override");
dotenv.config();

const port = 3000;

initializeDB();

app.set("view engine", "ejs");
initializePassport(
  passport,
  (email) => getUserByEmail(email),
  (id) => getUserById(id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // don't resave if nothing saved
    resave: false,
    // don't save empty value if no value
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
//? works with app.use(session()) middleware
app.use(passport.session());
//? allows us to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it because we're posting with a form
app.use(methodOverride("_method"));

const checkAuthenticated = (req, res, next) => {
  //? Passport adds this method to request object
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

const checkNotAuthenticated = (req, res, next) => {
  //? Passport adds this method to request object
  if (req.isAuthenticated()) return res.redirect("/");
  next();
};

app.get("/", checkAuthenticated, (req, res) =>
  res.render("index.ejs", { name: req.user.name, user: req.user })
);

app.get("/login", checkNotAuthenticated, (_req, res) => res.render("login.ejs"));
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (_req, res) => res.render("register.ejs"));
app.post("/register", checkAuthenticated, async (req, res) => {
  try {
    //* Hash the password to make it safe to save in database
    //? 10 rounds of salting
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log({ hashedPassword });

    addUser({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  const users = getUsers();
  console.log(users);
});

app.delete("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
