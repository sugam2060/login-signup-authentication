const database = require("./database");
const express = require("express");
const zod = require("zod")
const cors = require('cors')
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
database.connect();
const app = express();

const jwtpassword = "123455678910"

app.use(cors());


app.use(express.json());


const UsernameSchema = zod.string().email();
const passwordSchema = zod.string().refine(password => password.length >= 8);

function validateFormate(req,res,next){
    const username = req.body.username;
    const password = req.body.password;
    if(UsernameSchema.safeParse(username).success && passwordSchema.safeParse(password).success){
        next();
    }
    else{
        res.json({
            msg:"format doesnt matches"
        })
    }
}


function hashing(password){
    return crypto.createHash("sha256").update(password).digest("binary");
}


app.post('/signup',validateFormate,async(req,res)=>{
    const username = req.body.username;
    const hashedPassword = hashing(req.body.password);
    if(await database.userExist(username)){
        res.json({
            msg:"user exist"
        })
    }
    else{
        database.insertData(req.body.first_name,req.body.last_name,username,hashedPassword);
        res.json({msg:"user created"});
    }
    
})

async function validateUser(req,res,next){
    const username = req.body.username;
    const password = hashing(req.body.password);
    try{
        const userExist = await database.userExist(username);
        if(userExist){
            if(await database.validatePassword(username,password)){
                next()
            }
            else{
                res.json({
                   msg:"password does not match"
                })
            }
        }
        else{
            res.json({
                msg:"user does not exist"
            })
        }
    }
    catch(Err){
        console.log(Err);
    }
}

app.get('/login',validateUser,(req,res)=>{
    const token = jwt.sign({username:req.body.username},jwtpassword);
    res.json({
        token,
        msg:"successfully loged in"
    })
})

app.delete('/deleteUser',validateUser,async(req,res)=>{
    const username = req.body.username;
    const password = hashing(req.body.password);
    const Istrue = await database.deleteoperation(username,password);
    if(Istrue){
        res.json({
            msg:"user deleted"
        })
    }
    else{
        res.json({
            msg:"user not deleted"
        })
    }
})

app.listen(3000,()=>{
    console.log("server is running")
});



