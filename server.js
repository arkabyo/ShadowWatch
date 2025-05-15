const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// Set up session middleware
app.use(session({
  secret: "demoSecret", // 🔐 Change this to something strong for production
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60 * 1000 // Session lasts for $ minutes
  }
}));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route registration
app.use("/original", require("./routes/original"));
app.use("/fake", require("./routes/fake")); // optional, for your phishing route

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
