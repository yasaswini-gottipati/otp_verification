require('dotenv').config()
const express=require("express");
const bodyparser=require("body-parser");
const jwt=require("jsonwebtoken");
const mongoose=require("mongoose");
const path = require("path");
const accountsid=process.env.ACCOUNT_SID;
const authkey=process.env.AUTH_TOKEN;
const client=require("twilio")(accountsid,authkey);
const app=express();


mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser :true,useUnifiedTopology:true}).then(()=>{
  console.log("connected with mongodb")
  }).catch((e)=>{
    console.log(e);
  })


app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(express.static('public'));

const userSchema=new mongoose.Schema({
  username:String,
  mobileNo:String
})

const User = new mongoose.model("User",userSchema);


let OTP,user;


app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname+'/views/login.html'));
});

app.post("/login",async(req,res)=>{
  try{
    const {username,mobileNo}=req.body;
    console.log(req.body);

    const isuser =await User.findOne({mobileNo});
    if(isuser){
      return res
      .status(400)
      .json({msg:"user with same number already exists!!"});
    }

    user =new User({
      username,
      mobileNo
    });

    let digits="0123456789";
    OTP="";
    for(let i=0;i<4;i++)
    {
      OTP+=digits[Math.floor(Math.random()*10)];
    }

    await client.messages
      .create({
        body:`your Foodporium verification code is ${OTP} `,
        to:`+91${mobileNo}`,
        from:'+13158873771'
       }).then(() => {//res.status(200).json({msg: "message sent"})
        console.log("message sent");
      })
         .catch(err =>console.log(err));

        res.sendFile(path.join(__dirname+'/views/otpcheck.html'))
  } catch(e){
    res.status(500).json({error:e.message})
  }
});

app.post("/login/verify",async(req,res)=>{
  try{
     const {otp}=req.body;
     if( otp!=OTP )
     {
      //return res.status(400).json({msg:"Incorrect otp"});
      res.end("<h1>Incorrect otp</h1>");
     }
     user=await user.save();
    const token=jwt.sign({id:user._id},process.env.SECRET_KEY)
    res.end("<h1>correct otp</h1>");

  }catch(e){
    res.status(500).json({error:e.message})
  }
});



const port=process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});