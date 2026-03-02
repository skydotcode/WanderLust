const User = require("../models/user.js")

module.exports.renderSignUpForm = (req ,res)=>{
    res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs")
};

module.exports.signup = async(req , res)=>{
    try{
        let {username , email , password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser , password);
        console.log(registeredUser);
        req.login(registeredUser , (err)=>{
            if (err){
                return next(err);
            }
            req.flash("success " , "Welcome!");
            res.redirect("/listings");
        })
        
    } catch(e){
        req.flash("error" , e.message);
        return res.redirect(res.locals.redirectUrl)
    }};


module.exports.login = async(req, res)=>{
    let username = req.user.username;
    req.flash("success" ,`Welcome back , ${username} !`);
    let redirectUrl = res.locals.redirectUrl || "/listings" ;
    delete req.session.redirectUrl;
    return res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged Out Successfully");
        return res.redirect("/listings");
    })
};