import express from 'express';
const app = express()
const port = 3000
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import twilio from 'twilio';
import session from 'express-session';

app.use(session({
    secret: '21345',
    resave: false,
    saveUninitialized: true
}));

function generateOTP() {
    let digits = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
        let index = Math.floor(Math.abs(Math.random()) * 10);
        index = index % 10;
        otp += `${digits[index]}`;
    }
    return otp;
}

await mongoose.connect('mongodb://127.0.0.1:27017/Details');

const Schema = new mongoose.Schema({
    Name: String,
    DateofBirth: String,
    Address: String,
    ZIP: String,
    Profession: String,
    MobileNumber: String,
    EmailID: String,
    Password: String
});
const Details = mongoose.model('Details', Schema);

app.use(bodyParser.urlencoded({ extended: true }));

const accountSid = ''; //enter your accountSid
const authToken = ''; //enter your authToken

app.use(express.static("/Pages"))

app.get('/', (req, res) => {
    const isAuthenticated = req.session.authenticated || false;
    const userData = req.session.userData;
    res.render('/views/homepage.ejs', { isAuthenticated, userData });
})

app.get('/reset', (req, res) => {
    res.sendFile("/Pages/html/crtpswd.html")
})

app.get('/Sign-in', (req, res) => {
    res.sendFile("/Pages/html/Sign-in.html");
})

app.post("/send", async (req, res) => {
    var details = [];
    try {
        details = await Details.find({ EmailID: req.body.username, Password: req.body.password });
        if (details.length !== 0) {
            req.session.authenticated = true;
            req.session.userData = details[0];
            res.redirect('/');
        }
        else {
            req.session.authenticated = false;
            res.redirect("/Sign-in")
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/sendotp', (req, res) => {
    let o = generateOTP();
    const mbn = req.body.mbn;
    console.log(req.body);
    const client = twilio(accountSid, authToken);
    client.messages
        .create({
            body: "Hello there...Your OTP for the process of registration in GetArduino website is: " + o,
            to: mbn,
            from: '',
        }) //enter the mobile number provided by twilio
        .then((message) => {
            console.log(message.sid);
            let i = 0;
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    .visible{
                       display: block;
                    }
                </style>
            </head>
            <body style="background-color: rgb(111, 225, 247);">
                <h1 style="color: gray;">MOBILE OTP VERIFICATION:</h1><br>
                <p>OTP has been already sent to your mobile number ${mbn}.</p><br>
                <form>
                    <label style="font-size: large;font-weight: 600;">Enter OTP:</label>
                    <input type="text" for="otp" id="otp" style="border-radius: 5px;width: 100px;height: 25px;"><br><br>
                    <button id="c" style="height: 20px;width: 110px;background-color: rgb(56, 56, 239);color: white;border-color: rgb(56, 56, 239);font-weight: 600;">VERIFY OTP</button>
                </form>
                <div id="first" style="display: none;">
                    <p style="color:#013220;font-size: 15px;display:block;">OTP is verified...</p>
                    <a href="/html/Sign-in.html" style="display:block;"><button style="height: 20px;width: 110px;background-color: rgb(56, 56, 239);color: white;border-color: rgb(56, 56, 239);font-weight: 600;display:block;">PROCEED</button></a>
                </div>
                <div id="second" style="display: none;">
                    <p style="color:rgb(244, 50, 6);font-size: 15px;display:block;">OTP is not verified...</p>
                    <a href="/html/profile.html" style="display:block;"><button style="height: 20px;width: 140px;background-color: rgb(56, 56, 239);color: white;border-color: rgb(56, 56, 239);font-weight: 600;display:block;">SIGN IN AGAIN</button></a>
                </div>
                <script>
                    document.getElementById("c").addEventListener("click",(e)=>{
                        e.preventDefault();
                        console.log(e.target.previousElementSibling.previousElementSibling.previousElementSibling.value===${o});
                        if(e.target.previousElementSibling.previousElementSibling.previousElementSibling.value===\"${o}\"){
                           document.getElementById("first").style.display = "block";
                           document.getElementById("second").style.display = "none";
                           console.log(${i++});
                        }
                        else{
                            document.getElementById("first").style.display = "none";
                            document.getElementById("second").style.display = "block";
                        }
                    })
                </script>
            </body>
            </html>`);
            if (i === 1) {
                main1();
                async function main1() {
                    let arr = await Details.find({ EmailID: req.body.eid });
                    if (arr.length === 0) {
                        var details = new Details({
                            Name: req.body.first + " " + req.body.middle + " " + req.body.last,
                            DateofBirth: req.body.dob,
                            Address: req.body.add + ", " + req.body.cty + ", " + req.body.dist + ", " + req.body.state + ", " + req.body.country,
                            ZIP: req.body.pin,
                            Profession: req.body.prof,
                            MobileNumber: req.body.mbn,
                            EmailID: req.body.eid,
                            Password: req.body.pswd
                        })
                        await details.save();
                    }
                };
            }
        })
        .catch((err) => {
            console.log("Error sending otp:", err);
        })
});
let email;
app.post('/reset-password', async (req, res) => {
    email = req.body.ceid;
    let arr = await Details.find({ EmailID: new RegExp("^" + req.body.ceid) });
    if (arr.length === 0) {
        res.status(404).send("Your Email-ID is not registered...please sign-in first...")
    }
    else {
        console.log("Entry")
        res.sendFile("/Pages/html/update.html");
    }
})

app.post("/update", async (req,res)=>{
    let p = req.body.pswd1;
    await Details.findOneAndUpdate({ EmailID: email }, { Password: p }, {new: true});
    res.redirect("/Sign-in")
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
