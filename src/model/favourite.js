const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: "user",
    },
    apartment_id: {
        type: String,
        required: true,
        ref: "apartment",
    },

}, {
    timestamps: true
});

module.exports = mongoose.model("favourite", favouriteSchema);