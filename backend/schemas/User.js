const mongoose=require("mongoose");

const UserSchema=mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    password: {
        type:String,
        require: true,
    },
},{
    timestamps: true,
    versionKey:false
}
);

module.exports= mongoose.model('user',UserSchema);