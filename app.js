require('dotenv').config();
const express = require("express");
const mongoose = require ("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret:"Much sus secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const userSchema = new mongoose.Schema({
  email:String,
  password:String
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/home",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
  res.render("login");
});
app.get("/logout",(req,res)=>{
  req.logOut(function(err) {
    if (err) { 
      console.log(err);
     }
     else{
      res.redirect('/home');
     }
  });
});
app.post("/login",(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, function(err) {
    if (err) { 
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function() {
          res.redirect("/secrets")
      });
    }
  });
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
  User.register({username:req.body.username}, req.body.password, function(err, user) {
    if (err) {
      res.redirect("/register");
    }
    else{
    passport.authenticate("local")(req,res,function(err, result) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      }
      else if(result===false)
      {
        console.log("Register Authentication failed");
      }
      else{
        res.redirect("/secrets")
      }
    });}
  });
 
});
app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
      res.render("secrets");
    }
    else{
      res.redirect("/login");
    }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});