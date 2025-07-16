const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    admin_id: {
      type: String,
      required: true,
      unique: true,
      primaryKey: true,
    },
    first_name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxLength: [20],
    },
    last_name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxLength: [20],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_salt: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      maxlength: 11,
    },
    address: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    image: {
      type: { 
        url: String, 
        public_id: String 
      },
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "super-admin"],
      default: "admin",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admin", AdminSchema);
