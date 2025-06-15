const mongoose=require("mongoose");

const ItemSchema = mongoose.Schema({
   itemName: { type: String, required: true },
quantity: { type: Number, default: 1 },
bought: { type: Boolean, default: false },
userEmail: { type: String, required: true }

},
{
    timestamps: true,
    versionKey:false,
});

module.exports= mongoose.model("item", ItemSchema);