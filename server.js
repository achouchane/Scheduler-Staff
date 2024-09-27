const express = require("express");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const dbController = require("./controllers/db_controller"); // Import the router
const db = require("./db/db.js");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// Express session
app.use(
  require("express-session")({
    secret: "This is our secret session 2016 for users!",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Body-Parser
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Landing
app.get("/", autoRedirect, function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Public files <this needs to stay right below app.get("/")!!!!
app.use(express.static(__dirname + "/public"));

// GOOGLE AUTH
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  function (req, res) {
    res.redirect("/employee");
  }
);

if (process.env.GOOGLE_CLIENT_ID)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          let user = await usersCollection().findOne({
            username: profile.displayName,
            email: profile.emails[0].value,
          });
          if (user) {
            return done(null, user);
          } else {
            const newUser = {
              username: profile.displayName,
              email: profile.emails[0].value,
              userType: "employee",
            };
            const result = await usersCollection().insertOne(newUser);
            return done(null, result.ops[0]);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

// LINKED IN AUTH
app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    failureRedirect: "/",
    scope: ["r_emailaddress", "r_basicprofile"],
  })
);

app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/employee",
    failureRedirect: "/",
  })
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK,
      state: true,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await usersCollection().findOne({
          username: profile.name.givenName,
          email: profile.emailAddress,
        });
        if (user) {
          return done(null, user);
        } else {
          const newUser = {
            username: profile.name.givenName,
            email: profile.emailAddress,
            userType: "employee",
            picture: profile.photos[0].value,
          };
          const result = await usersCollection().insertOne(newUser);
          return done(null, result.ops[0]);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Use the router from db_controller.js
app.use("/", dbController);

// LOCAL AUTH
app.post("/register", async function (req, res) {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      userType: req.body.userType,
      picture:
        "https://raw.githubusercontent.com/clsavino/react-shift-scheduler/master/public/assets/images/logo.png",
    });

    await User.register(newUser, req.body.password);
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.sendFile(path.resolve(__dirname, "public", "error.html"));
  }
});

// LOGIN AUTH
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    reRoute(req, res);
  }
);

// Functions for Auth
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function reRoute(req, res) {
  if (req.user.userType === "manager") {
    res.redirect("/manager");
  } else {
    console.log("employee=-=-=-=-=-=-=-");
    res.redirect("/employee");
  }
}

function autoRedirect(req, res, next) {
  if (req.isAuthenticated()) {
    reRoute(req, res);
  } else {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  }
}

app.get("/user", isLoggedIn, function (req, res) {
  res.send(req.user);
});

// Restricting routes
app.get("/login", isLoggedIn, function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.get("/register", function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.get("/manager", isLoggedIn, function (req, res) {
  if (req.user.userType === "manager") {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  } else {
    res.sendFile(path.resolve(__dirname, "public", "notauth.html"));
  }
});

app.get("/manager/*", isLoggedIn, function (req, res) {
  if (req.user.userType === "manager") {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  } else {
    res.sendFile(path.resolve(__dirname, "public", "notauth.html"));
  }
});

app.get("/employee", isLoggedIn, function (req, res) {
  if (req.user.userType === "employee") {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  } else {
    res.redirect("/manager");
  }
});

app.get("/employee/*", isLoggedIn, function (req, res) {
  if (req.user.userType === "employee") {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  } else {
    res.redirect("/manager");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

const routes = require("./controllers/db_controller.js");
app.use("/", isLoggedIn, routes);

app.get("*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "public", "404.html"));
});

// Start the server only after the database connection is successful
db.once("open", function () {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
