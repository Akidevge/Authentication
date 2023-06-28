require('dotenv').config();
const express = require("express");
const mongoose = require ("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const userSchema = new mongoose.Schema({
  email:String,
  password:String
});
const User = mongoose.model("User",userSchema);
app.get("/home",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",(req,res)=>{
  const uname = req.body.username
  User.findOne({email:uname}).then((docs)=>{
    if(!docs)
    {
      res.send("email not registered")
    }
    else
    {
      bcrypt.compare(req.body.password, docs.password, function(err, result) {
        if (result===true) {
          console.log("Login success");
          res.render("secrets");
        }
        else{
          res.send("Login failed")
        }
    });
    }
  })
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      const register = new User({
        email:req.body.username,
        password:hash
      });
      register.save().then((docs)=>{
        if (!docs) {
            res.send("error saving docs");
        }
        else{
            res.render("secrets");
        }
    });
});
});
});
app.get("/secrets",(req,res)=>{
    res.render("secrets");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});