const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    category_id: {
      type: String,
      required: true,
      unique: true,
      primaryKey: true,
    },
    category_type: {
      type: String,
      enum: ["shared", "rent"],
      required: true,
      lowercase: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("category", CategorySchema);
