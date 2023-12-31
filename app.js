require('dotenv').config();
const express = require("express");
const mongoose = require ("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
  password:String,
  googleId:String,
  secret:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);

  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
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
      res.redirect('/');
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
    User.find({secret:{$ne:null}}).then((usersecrets)=>{
      if(!usersecrets)
      {
        res.send("No secrets found");
      }
      else
      {
        res.render("secrets",{userwithsec:usersecrets});
      }})
});
app.get("/submit",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
  }
  else{
    res.redirect("/login");
  }
});
app.post("/submit",(req,res)=>{
  const submitsecret=req.body.secret;
  User.findById(req.user.id).then((userfound)=>{
    if(!userfound)
    {
      res.send("No user found");
    }
    else
    {
      userfound.secret=submitsecret;
      userfound.save().then(()=>{
        res.redirect("/secrets");
      })
    }
  })
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});