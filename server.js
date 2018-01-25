const express = require(`express`);
const mongoose = require(`mongoose`);
const bodyParser = require(`body-parser`);
const {UserModel} = require(`./models/usermodel`);
const passport = require(`passport`);
const googleStrat = require(`passport-google-oauth`).OAuth2Strategy;
const strat = require(`passport-local`).Strategy;
const session = require(`express-session`);
const bcrypt = require(`bcryptjs`);

mongoose.connect(`mongodb://localhost:27017/reactTodo`);

let gg;
let app = express();
let Port = process.env.port || 5454;

app.use(bodyParser.json());
app.use(session({secret:"shashvat"}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(`Access-Control-Allow-Methods`, `POST`);
    res.header(`Access-Control-Expose-Headers`, `x-auth`);
     next();
});

passport.serializeUser((user,done)=>{
    done(null,user._id);
});
passport.deserializeUser((user,done)=>{
    done(null,user);
});

passport.use(`google`,new googleStrat({
    clientID:`774255859953-1qg5e3v1k3a3u02tgc0j2gl3phvr9teq.apps.googleusercontent.com`,
    clientSecret:`kT-17-RtR9qZlHZfcx4q7Ff7`,
    callbackURL     :`http://localhost:5454/googledone`
},
    (token,refreshToken,Profile,done)=>{
        process.nextTick(()=>{
            UserModel.findOne({Gid:Profile.id}).then((user)=>{
                if(user){
                    return done(null,user);
                }else{
                    let newuser = new UserModel({
                        username:Profile.displayName,
                        email:Profile.emails[0].value,
                        password:`none`,
                        Gid:Profile.id,
                        Gtoken:token,
                        Gname:Profile.displayName,
                        Gemail:Profile.emails[0].value
                    });
                    newuser.save().then().catch((err)=>{console.log(err.message)});
                    return done(null,newuser);
                }
            })
        })
    }));


passport.use(`local`,new strat((username,password,done)=>{
    console.log(`inside of passport.use`);
    console.log(`username:`);
    console.log(username);
    console.log(`password:`);
    console.log(password);
    UserModel.findOne({email:username}).then((doc)=>{

        console.log(doc);
        if(doc) {
            bcrypt.compare(password, doc.password).then((result) => {

                if (result) {
                    console.log(`right password`);
                    return done(null, doc.toJSON());
                }
                else {
                    console.log(`wrong password`);
                    return done(`wrong`, false);
                }
            }).catch((err) => {
                console.log(err.message);
                return done(null)
            });
        }else{
            return done(null,false);
        }
    })
}));



app.post(`/ping`,(req,res)=>{
    console.log(req.body);
    res.send(`ping back`);
});

app.post(`/login`,passport.authenticate(`local`,{
    successRedirect:`/success`,
    failureRedirect:`/failed`
}));

app.get(`/success`,(req,res)=>{
    console.log(`success`);
    res.header(`x-auth`,req.user);
    res.send(req.user);
});
app.get(`/failed`,(req,res)=>{
    console.log(`authentication failed`);
   res.send(`authentication failed`);
});

app.post(`/reg`,(req,res)=>{
    let newUser = new UserModel(req.body);
    newUser.save().then().catch((err)=>{console.log(err.message)});
});

app.get(`/google`,passport.authenticate(`google`,{scope:[`profile`,`email`]}));

app.get(`/googledone`,passport.authenticate(`google`,{
    successRedirect:`/googlesuccess`,
    failureRedirect:`/googlefailure`
}));

app.get(`/googlesuccess`,(req,res)=>{
    console.log(`google success`);
    res.header(`x-auth`,req.user);
    gg=req.user;
    console.log(req.user);
    res.redirect(`http://localhost:3001/`);

});
app.get(`/googlefailure`,(req,res)=>{
    console.log(`google failure`);
    res.send(`google failure`);
});
app.get(`/getUser`,(req,res)=>{
    console.log(gg);
    res.send(gg);
});


app.listen(Port,()=>{console.log(`listening to ${Port}`)});


//  {
// method: 'GET',
//     mode: 'no-cors',
//     headers: {
//     'Access-Control-Allow-Origin': '*',
//         'Content-Type': 'application/json',
// },
// withCredentials: true,
//     credentials: 'same-origin',
// }


/*
* 774255859953-1qg5e3v1k3a3u02tgc0j2gl3phvr9teq.apps.googleusercontent.com
*
* kT-17-RtR9qZlHZfcx4q7Ff7
* */