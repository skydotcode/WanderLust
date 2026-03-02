const mongoose = require("mongoose");
const reviews = require("./reviews");
const { ref, required } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{type:String , require:true},
    description:{type:String },
    image:{
        url:String,
        filename : String
    },
    price:{type:Number , require:true},
    location:{type:String ,  require:true},
    country:{type:String , require:true},
    reviews : [
        {
            type: Schema.Types.ObjectId,
            ref : "Review"
        }
    ] ,
    owner : {
        type: Schema.Types.ObjectId ,
        ref: "User"
    },
    geometry :{
        type :{
            type:String , 
            requiredt:true
        },
        coordinates : {
            type:[Number , Number] , 
            required:true
        }
    },
    categories :{
        type : [String] , 
        enum: ["Forts", "Mountains", "Hiking", "Pools", "Farms", "Arctic" , "Cozy"],
        required: true,
    }
});

listingSchema.post("findOneAndDelete" , async (listing)=>{
    if(listing){
        reviews.deleteMany({_id : {$in : listing.reviews}});
    }
    
})

const Listing =mongoose.model("Listing" , listingSchema);
module.exports = Listing;

