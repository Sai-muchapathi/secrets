//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
const port = 3000;

//adding session
app.use(session({
    secret: "secrefjfli",
    resave:false,
    saveUninitialized: false
}));
//Initializing passport
app.use(passport.initialize());
//telling passport to use for session
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//adding passportLocalMongoose to the schema
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logOut(req.user, err => {
        if(err) return next(err);
        res.redirect("/");
    });
});

app.post("/register", function(req, res) {
    User.register(
        {username: req.body.username}, req.body.password, function(err, user) {
            if(err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                });
            }
        });
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    });
});



app.listen(port, () => {
    console.log("Listening on port 3000......");
});