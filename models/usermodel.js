const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcryptjs`);

mongoose.connect(`mongodb://localhost:27017/reactTodo`);

let UserSchema = new mongoose.Schema({
    username:{
        required:true,
        type:String
    },
    email:{
      type:String,
      required:true,
      validate:validator.isEmail,
      unique:true
    },
    password:{
        type:String,
        required:true
    },
    Gid:{
        type:String
    },
    Gtoken:{
        type:String
    },
    Gname:{
        type:String
    },
    Gemail:{
        type:String
    },
});
UserSchema.pre(`save`,function(done){
    console.log(this);
        bcrypt.genSalt(10).then((salt)=>{
            return bcrypt.hash(this.password,salt);
        }).then((hash)=>{
            this.password=hash;
            done();
        }).catch((err)=>{console.log(err.message)});

    });

let UserModel = mongoose.model(`user`,UserSchema);

module.exports = {UserModel};