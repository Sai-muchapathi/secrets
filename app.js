//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");



const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});
const User = new mongoose.model("User", userSchema);



app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });  
    newUser.save(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });  
});

app.post("/login", function(req, res) {
    const userName = req.body.username;
    const passWord = md5(req.body.password);
    User.findOne({email: userName}, function(err, foundUser) {
        if(err) {
            
            console.log(err);
            
        } else {
            if(foundUser) {
                if(foundUser.password === passWord) {
                    res.render("secrets");
                }
            }
        }
    });
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
    console.log("Listening on port 3000......");
});