if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express = require("express");
const MongoStore = require('connect-mongo').default;
const app = express();
const mongoose = require("mongoose");
const Listing = require("/Users/sachin/MAJORPROJECT/models/listings.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require ("./utils/wrapAsync.js");
const ExpressError = require ("./utils/ExpressError.js")
const session = require("express-session");
const flash  = require ("connect-flash");

console.log(flash);
const cloudConfig = require("./cloudConfig");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require('passport-local-mongoose');
const User = require("./models/user.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")


const dbURL = process.env.ATLAS_URL;
console.log("DB URL:", dbURL);     
console.log("Session secret:", process.env.SECRET);

main().then(()=>{
    console.log("connected to DB")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL , {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static( path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET  
    },
    touchAfter : 24 * 3600 ,
});

store.on("error" , (err)=>{
    console.log("Error in MONGO SESSION" ,err )
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: false,
    sameSite: "lax", 
  }
};
// app.get("/" , (req, res)=>{
//     res.send("Hello World");
// })


app.set("trust proxy", 1);
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(async (username, done) => {
  try {
    const user = await User.findOne({ username: username }); // ← findOne by username
    done(null, user || false);
  } catch(e) {
    done(null, false);
  }
});

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
})

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

app.use((req,res,next)=>{
    next(new ExpressError(404 , "Page not Found"))
    // res.send("page not found")
});

app.use((err,req,res,next)=>{
    let {statusCode = 500, message="Something went wrong"} = err;
    res.render("error.ejs" , {message})
    // res.status(statusCode).send(message);
})

app.listen(8080 , ()=>{
    console.log("app is listening")
})