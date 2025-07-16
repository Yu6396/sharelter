const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user_id: {
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
      trim: true,
    },
    address: {
      type: String,
      lowercase: true,
      trim: true,
    },
    image: {
      type: { 
        url: String, 
        public_id: String 
      },
      default: null,
    },
    identification: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      sparse: true,
    },
    is_agent: {
      type: Boolean,
      default: false,
    },
    post_count: {
      type: Number,
      default: 0,
    },
    tier_type: {
      type: String,
      enum: ["basic", "standard", "pro"],
      lowercase: true,
      trim: true,
      default: null,
    },
     tier_history: [
    {
      tier_type: String,
      amount: Number,
      post_count_added: Number,
      payment_reference: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  about: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  disable_post: {
    type: Boolean,
    default: false,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", UserSchema);
