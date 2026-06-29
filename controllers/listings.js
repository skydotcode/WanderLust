const Listing = require("../models/listings.js");
const maps = require("../public/js/map.js");

module.exports.index = async (req , res)=>{

    //category finding
    const {category} = req.query;
    let filter ={};
    if(category){
        filter.categories = category; 
        const allListings = await Listing.find(filter);
        return res.render("listings/index.ejs" , {allListings ,category });
    }

    console.log("user",req.user);

    //index route
    let allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});

};

module.exports.renderNewForm = (req , res)=>{
     res.render("listings/new.ejs")
};

module.exports.show = async(req , res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews" , populate: {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error" , "Listing doesn't Exist");
        return res.redirect("/listings");

    }console.log(listing)
    let location = listing.location;
    let country = listing.country;
    let result = await maps.fetchCoordinates(location, country);
    console.log("result:" , result);

    let latitude = result.features[0].geometry.coordinates[1];
    let longitude = result.features[0].geometry.coordinates[0];

    res.render("listings/show.ejs" , {listing , latitude , longitude});
};

module.exports.create = async(req , res , next)=>{
    const url = req.file.path;
    const filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    
    newListing.image = {url , filename} ;

    const location = req.file.location;
    const country = req.file.country;
    let result = await maps.fetchCoordinates(location, country);
    console.log(result);

    let latitude = result.features[0].geometry.coordinates[1];
    let longitude = result.features[0].geometry.coordinates[0];
    let type = result.features[0].geometry.type;

    const geometry = {
        type : type , 
        coordinates : [longitude , latitude]
    }
    newListing.geometry = geometry;
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");
};

module.exports.edit = async(req , res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing doesn't Exist");
        return res.redirect("/listings");
    }
    let originalImageUrl= listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs" , {listing ,originalImageUrl});
};

module.exports.update = async(req , res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id , { ...req.body.listing});
    if(req.file){
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = {url , filename};
    await listing.save();
    } 
    req.flash("success" , " Listing Updated Succesfully!");
    res.redirect(`/listings/${id}`);
    res.locals.success = req.flash("success");
};

module.exports.delete = async(req , res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id );
    console.log(deletedListing);
    req.flash("success" , "Listing Deleted!");
    res.redirect(`/listings`);
    res.locals.success = req.flash("success");
};