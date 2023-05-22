const express = require('express');
const bodyParser = require('body-parser');
const fast2sms = require('fast-two-sms');
const app = express();
let reqotp;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, mobileNo } = req.body;

  // Perform authentication logic here
  // For simplicity, we're just checking for a hardcoded username and password
  function otpcode() {
    // Generate a random number between 0 and 9999
    const randomNumber = Math.floor(Math.random() * 10000);
  
    // Pad the number with leading zeros if necessary
    const final = randomNumber.toString().padStart(4, '0');
  
    return final;
  }
  
  // Example usage:
   reqotp = otpcode();

  var options={
    authorization:process.env.AUTHORIZATION,
    message:`Your Login code:${reqotp}`,
    numbers:[mobileNo]
  }

  fast2sms.sendMessage(options)
    .then((resp)=>{
        console.log(resp);
    })
    .catch((err)=>{
        console.log(err);
    })

  res.render('otpcheck')
});

app.post('/otpcheck',(req,res)=>{
   const {otp}= req.body
   if(otp===reqotp) {
    res.send('Login successful!');
  } else {
    res.send('Invalid OTP!!');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
