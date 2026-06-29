const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const flash  = require ("connect-flash");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl, saveRedirectUrl2} = require("../middleware.js")

const userControllers = require("../controllers/users.js")

router.route("/signup")
.get(userControllers.renderSignUpForm)
.post(saveRedirectUrl, wrapAsync(userControllers.signup))


router.route("/login")
.get(userControllers.renderLoginForm )

router.post("/login", (req, res, next) => {
  const redirectUrl = req.session.redirectUrl || "/listings";
  
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome back! ${user.username} `);
      req.session.save((err) => {
        if (err) return next(err);
        res.redirect(redirectUrl);
      });
    });
    
  })(req, res, next);
});
router.get("/logout" , userControllers.logout);

module.exports = router;