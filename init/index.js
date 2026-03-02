const mongoose = require("mongoose");
const initData = require("../init/data.js");
const Listing = require("../models/listings.js");

main().then(()=>{
    console.log("connected to DB")
}).catch((err) => {console.log(err)});

// main().then(() => {
//     console.log("connected to DB");
//   }).catch((err) => {console.log(err)});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({...obj , owner : "69a15b8a7bf9e113d2761433"}))
    await Listing.insertMany(initData.data);
    console.log("data initialised");
};

initDB();