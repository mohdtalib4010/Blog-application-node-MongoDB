const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config();
const mongoose = require("mongoose");
const User = require("./models/userSchima");
const Post = require("./models/postSchima");
const _ = require("lodash");
const { text } = require("body-parser");
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// Middleware
app.use(express.json());
app.use(cookieParser());

// DATABASE CONFIG

mongoose.connect('mongodb://localhost:27017/BlogDB',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }).then(()=>{
    console.log("connected to mongo db");
}).catch((e)=>{
    console.log(e);
})

// Login & Registration Routes

// JWT CONFIG
function auth(req, res, next) {
  const authcookie = req.cookies.authcookie
  if (!authcookie){
    res.redirect('login');
  } 
  // return res.status(401).send('Access Denied');

  try {
     
      const verified = jwt.verify(authcookie, process.env.TOKEN_SECRET);
      // console.log(verified);
      const user = User.findOne({_id: verified.id},(err,result)=>{
          // console.log(result)
          req.data = result;
          next();
      });
     
  } catch(err) {
      res.status(400).send(auth= false,'Invalid Token');
  }    
}


app.get('/login', (req,res)=> {
  res.render('login');
});

app.get('/register', (req,res)=> {
  res.render('register');
});


app.get('/logout', auth, async (req,res)=> {
  try {
       res.clearCookie('authcookie');
       console.log('logout sucecessfully');
       res.redirect('/');
  }catch(error){
       res.status(500).send()
  }
});


app.post("/register", async(req,res)=>{
   // CHECKING USER IS ALREADY IN THE DATABASE
   const usernameExist = await User.findOne({email: req.body.username});
   if (usernameExist) return res.status(400).send('Username already exists');         

  // HASH PASSWORD
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(req.body.password, salt);



   const user = new User({
         username: req.body.username,
         email: req.body.email,
         password: req.body.password
   });
   try{
        await user.save();
        res.redirect('/login');
   }catch(err){
         res.status(400).send(err);
   }
 
});

app.post('/login',(req,res)=>{
  const username = req.body.username;
  const password= req.body.password;
  
  User.findOne({username: username})
  .then((user)=>{
        if(user.password === password){
              const id = user.id;
              const token = jwt.sign({id}, process.env.TOKEN_SECRET);
              res.cookie('authcookie',token,{maxAge:900000})
              
              res.redirect('/');
        }else{
            res.send('check your username');
        }
  }).catch((err)=>{
      console.log(err);
  });
})


// Post routes

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";



app.get("/", function(req,res){
 
  Post.find({}, function(err, posts){

      res.render("home",{
        startingContent: homeStartingContent,
        posts: posts
      });
  })

});

app.get("/about", function(req,res){
   res.render("about",{aboutContent : aboutContent});
});

app.get("/contact",function(req,res){
   res.render("contact",{contactContent: contactContent});
});

app.get("/compose", auth,function(req,res) {
    res.render("compose")
});


app.post("/compose", function(req,res){
  
  const post = new Post ({
    title : req.body.postTitle,
    content : req.body.postBody
  });

   post.save( function(err){
      if(!err){
          res.redirect("/");       
      }  
   });

  
})


app.get("/posts/:postId", function(req,res){
  const requestedPostId = req.params.postId;
 
  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});


app.listen(process.env.PORT || 3000, ()=>{
   console.log("server strated at port 3000");
});