const express = require("express");
const router = express.Router();
const wrapAsync = require ("../utils/wrapAsync.js");
const ExpressError = require ("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Listing = require("../models/listings.js");
const Review = require("../models/listings.js");
const review = require("../routes/review.js");
const {isLoggedIn, isAuthor, isOwner} = require("../middleware.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

const validateListing=(req,res,next)=>{
    let{error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
}

router.route("/")
.get(wrapAsync(listingController.index)) //index route
.post(validateListing,isLoggedIn,upload.single("listing[image]"),wrapAsync( listingController.create) //create route
);

//new route
router.get("/new" ,validateListing, isLoggedIn, listingController.renderNewForm )

//search
router.get("/search" , async(req,res)=>{
    let {q} = req.query ;
    console.log(q);
    let allListings = await Listing.find({
        $or:[
            {title: { $regex:q , $options:"i"}} , 
            {description: { $regex:q , $options:"i"}} , 
            {price: Number(q) || 0 } , 
            {location: { $regex:q , $options:"i"}} , 
            {country: { $regex:q , $options:"i"}} , 
        ]
    });
    return res.render("listings/index" , {allListings});
});

router.route("/:id")
.get( wrapAsync(listingController.show)) //show route
.put(isLoggedIn,upload.single("listing[image]"), wrapAsync(listingController.update)) //update route
.delete(isLoggedIn,upload.single("listing[image]"),wrapAsync(listingController.delete)); //delete route

//edit route
router.get("/:id/edit" ,validateListing,isLoggedIn,wrapAsync( listingController.edit ))

//index route
// router.get("/" , wrapAsync(listingController.index));





//show route
// router.get("/:id" , wrapAsync(listingController.show));

//create route
// router.post("/" ,isLoggedIn,upload.single("listing[image]"),wrapAsync( listingController.create));
// router.post("/" ,upload.single('listing[image]'), (req , res)=>{
//     res.send(req.file);
// })



//update route
// router.put("/:id" ,isLoggedIn,upload.single("listing[image]"), wrapAsync(listingController.update));  

//delete route
// router.delete("/:id" ,isOwner,wrapAsync(listingController.delete));

module.exports = router;
