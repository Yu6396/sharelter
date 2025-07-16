const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({
    transaction_id:{
        type: String,
        required: true,
        unique: true,
        primaryKey: true,

    },
    user_id:[{
        type: String,
        ref: "user",
    }],
    tier_type:{
        type: String,
        enum: ["basic", "standard", "pro"],
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    payment_reference:{
        type: String,
        required: true,
    },
    transaction_status:{
        type: String,
        enum: ["pending", "success", "failed","abandoned","cancelled"],
        required: true,
    }
}
,
{
    timestamps: true,
});

module.exports = mongoose.model("transaction", transactionSchema);