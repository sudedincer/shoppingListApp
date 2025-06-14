const mongoose=require("mongoose");

const ToDoSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    name: {
        type: String,
        min:5,
        max:50,
        required: true,
    },
    description:{
        type: String,
         min: 5,
         max:150,
    },
    isCompleted:{
        type: Boolean,
        default:false,
    }
},
{
    timestamps: true,
    versionKey:false,
});

module.exports= mongoose.model("todo", ToDoSchema);