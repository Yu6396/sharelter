const mongoose = require("mongoose");

const ApartmentSchema = new mongoose.Schema(
  {
    apartment_id: {
      type: String,
      required: true,
      unique: true,
      primaryKey: true,
    },
    category_id: 
      {
        type: String,
        ref: "category",
      },
    
    user_id: 
      {
        type: String,
        ref: "user",
      },
   
  amenities: {
    type: Object,
    bathroom: { type: Number, required: true },
    bedroom: { type: Number, required: true },
    kitchen: { type: Number, required: true },
    pet: { type: Boolean },
    size: { type: String, required: true, lowercase: true, trim: true },
  },


    description: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_type: {
      type: String,
      required: true,
      enum: ["single", "2bedroom", "3bedroom"] ,
    },
    apartment_address_no: {
      type: Number,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_street_name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_state:{
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_floor: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_flatname_count: {
      type: Number,
      // required: true,
      lowercase: true,
      trim: true,
    },
    apartment_prefered_flatmate: {
      type: String,
      enum: ["male", "female"],
      // required: true,
      lowercase: true,
      trim: true,
      
    },
    apartment_amount: {
      type: Number,
      required: true,
      lowercase: true,
      trim: true,
    },
    apartment_image: [
      {
        url:{
          type: String,
          required: true,
          lowercase: true,
          trim: true
        },
        public_id:{
          type: String,
          required: true,
          lowercase: true,
          trim: true

        },
        
      },

    ],
    is_available: {
      type: Boolean,

      default: true,
    },
    is_favourite: {
      type: Boolean,
      default: false,
    },
    is_reported: {
      type: Boolean,
      default: false,
    },
    is_reported_count: {
      type: Number,
      default: 0,
    },
    is_allowed_pet: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("apartment", ApartmentSchema);
