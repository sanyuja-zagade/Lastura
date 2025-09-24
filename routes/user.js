const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
    // Sign-up
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    // Log-in
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, 
        passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), 
        wrapAsync(userController.login)
);

// Log-out
router.get("/logout", userController.logout);

module.exports = router;