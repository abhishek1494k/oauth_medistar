const express = require("express");
const app = express();
require("dotenv").config();

const { connection } = require("./config/db");
const { UserModel } = require("./models/user.model");

const jwt = require("jsonwebtoken");
const { uuid } = require("uuidv4");

const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// ---------->>>>>>>> Configure Strategy <<<<<<<<--------- //
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.google_clientID,
      clientSecret: process.env.google_clientSecret,
      callbackURL: "https://oauth-medistar.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      var { email } = profile._json;
      let user;
      try {
        user = await UserModel.findOne({ email });
        if (user) {
          return cb(null, user);
        }
        user = new UserModel({
          first_name: profile.displayName,
          last_name: profile.name.familyName || profile.displayName,
          mobile: profile._json.email,
          email: profile._json.email,
          password: uuid(),
        });
        await user.save();
        return cb(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);
// ---------->>>>>>>> Authenticate Requests <<<<<<<<--------- //
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    let user = req.user;
    var token = jwt.sign({ userID: user._id, email: user.email }, "masai", {
      expiresIn: "1d",
    });
    res.redirect(
      `http://127.0.0.1:5500/Frontend/index.html?&email=${user.email}&id=${token}&name=${user.first_name}&last_name=${user.last_name}`
    );
  }
);

//---------------------------------------------------------------------------------------------------------------------------//

const passport2 = require("passport");
var GitHubStrategy = require("passport-github2").Strategy;

// ---------->>>>>>>> Configure Strategy <<<<<<<<--------- //

passport2.use(
  new GitHubStrategy(
    {
      clientID: process.env.github_clientID,
      clientSecret: process.env.github_clientSecret,
      callbackURL: "https://oauth-medistar.onrender.com/auth/github/callback",
      scope: "user:email",
    },
    async function (accessToken, refreshToken, profile, done) {
      // console.log(profile);
      var first_name = profile.displayName;
      var last_name = profile.displayName;
      let email = profile.emails[0].value;
      var mobile = profile.emails[0].value;
      let user;
      try {
        user = await UserModel.findOne({ email });
        if (user) {
          return done(null, user);
        }
        user = new UserModel({
          first_name,
          last_name,
          mobile,
          email,
          password: uuid(),
        });
        await user.save();
        return done(null, user);
      } catch (error) {
        console.log(error);
      }
    }
  )
);

// ---------->>>>>>>> Authenticate Requests <<<<<<<<--------- //
app.get(
  "/auth/github",
  passport2.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport2.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    let user = req.user;
    console.log(user);
    var token = jwt.sign({ userID: user._id, email: user.email }, "masai", {
      expiresIn: "1d",
    });
    console.log(token);
    res.redirect(
      `http://127.0.0.1:5500/Frontend/index.html?id=${token}&nname=${user.first_name}&last_name=${user.last_name}`
    );
  }
);

// ---------->>>>>>>> Connection <<<<<<<<--------- //
app.listen(4500, async () => {
  try {
    await connection;
    console.log("Connected to DB");
    console.log(`http://localhost:4500/`);
  } catch (error) {
    console.log("Error in Connecting to DB");
  }
});
