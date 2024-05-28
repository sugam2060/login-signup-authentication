
const mongoose = require("mongoose");

function connect(){
     mongoose.connect("mongodb+srv://sugam2060:W07mLjoGwQCNMYqE@cluster0.czgcs38.mongodb.net/UserData").then(()=>{
        console.log("connection established");
     }).catch((err)=>{
        console.log("connection failed",err);
     });
}
connect();

const UserModel = mongoose.model("users",{
    first_name:String,
    last_name:String,
    username:String,
    password:String
})

function insertData(firstname,lastname,username,password){
    const user = new UserModel({
        first_name:firstname,
        last_name:lastname,
        username:username,
        password:password
    })
    user.save().then().catch((err)=>{
        console.log(err)
    })
}

async function userExist(username){
    try {
        const user = await UserModel.findOne({ username: username });
        return user != null;
    } 
    catch (error) {
        console.error('Error checking if user exists:', error);
        return false;  
      }
}


async function validatePassword(username,password){
    try{
        const pass = await UserModel.findOne({$and:[{username:username},{password:password}]});
        return pass != null;
    }
    catch(err){
        console.log(err);
    }
}

async function deleteoperation(username,password){
   await UserModel.deleteOne({$and:[{username:username},{password:password}]});
   return true;
}

module.exports = {
    connect,
    insertData,
    userExist,
    validatePassword,
    deleteoperation
}