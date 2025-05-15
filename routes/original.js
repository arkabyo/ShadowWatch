// routes/original.js

const express    = require("express");
const speakeasy  = require("speakeasy");
const router     = express.Router();

// hard‑coded TOTP secret (you’ve already added this in your Authenticator)
const fixedSecret = "JBSWY3DPEHPK3PXP";


// 1) Show the login page every time you hit GET /original/login

router.get("/login", (req, res) => {
  res.render("original-login", { error: null });
});


// 2) Handle login form submissions

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const isCorrect = 
    username === "hack@avijitroy.com" && 
    password === "DoNotLook";

  if (!isCorrect) {
    // oops—bad creds
    return res.render("original-login", { error: "Nope, try again." });
  }

  // save stuff in session for later
  req.session.username           = username;
  req.session.original_mfaSecret = fixedSecret;

  // if we’ve already done 2FA this session, skip ahead
  if (req.session.original_loggedIn) {
    return res.redirect("/original");
  }

  // otherwise send ’em to the MFA page
  return res.redirect("/original/mfa");
});


// 3) Show the MFA page (just a code input, no QR here)

router.get("/mfa", (req, res) => {
  res.render("original-mfa");
});

router.post("/mfa", (req, res) => {
  const { token } = req.body;

  const ok = speakeasy.totp.verify({
    secret:   req.session.original_mfaSecret,
    encoding: "base32",
    token,
    window:   1,
  });

  if (!ok) {
    // wrong code
    return res.send(`
      <h3>That code didn’t work.</h3>
      <a href="/original/login">Back to login</a>
    `);
  }

  // mark 2FA done
  req.session.original_loggedIn = true;
  return res.redirect("/original");
});


// 4) The protected dashboard

router.get("/", (req, res) => {
  if (!req.session.original_loggedIn) {
    // not allowed yet
    return res.redirect("/original/login");
  }

  res.render("original-welcome", {
    username:  req.session.username,
    sessionID: req.sessionID   // useful for your demo
  });
});


// 5) “Logout” (just sends you back to login, keeps the session alive)

router.get("/logout", (req, res) => {
  res.redirect("/original/login");
});

module.exports = router;
