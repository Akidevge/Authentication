require('dotenv').config();
const express = require("express");
const mongoose = require ("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const md5 = require("md5");
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
  const pswd=md5(req.body.password)
  User.findOne({email:uname}).then((docs)=>{
    if(!docs)
    {
      res.send("email not registered")
    }
    else
    {
      if (pswd===docs.password) {
        console.log("Login success");
        res.render("secrets");
      }
      else{
        res.send("Login failed")
      }
    }
  })
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
  const register = new User({
    email:req.body.username,
    password:md5(req.body.password)
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
app.get("/secrets",(req,res)=>{
    res.render("secrets");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});