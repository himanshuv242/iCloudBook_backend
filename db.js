const mongoose = require('mongoose')
const mongoURI = "mongodb+srv://himanshuv242:Job%401215225@icloudbook.jl6a7z7.mongodb.net/?retryWrites=true&w=majority"

const connectToMongo = () =>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to mongo successfully");
    })
}

module.exports = connectToMongo;