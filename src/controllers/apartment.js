const apartment = require("../model/apartment");
const category = require("../model/category");
const user = require("../model/user");
const messages = require("../messages");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary");
const {determineTierType} = require("../utils/index");

const getAllApartment = async (req, res) => {
  try {
    const apartmentData = await apartment.find();
    res.status(200).json({
      message: messages.ALL_APARTMENTS,
      data: apartmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleApartment = async (req, res) => {
  try {
    const { apartment_id } = req.params;
    const apartmentData = await apartment.findOne({
      apartment_id: apartment_id,
    });
    if (!apartmentData) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }
    res.status(200).json({
      message: messages.SINGLE_APARTMENT,
      data: apartmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const postApartment = async (req, res) => {
 
  const { email } = req.params;
  const {
    type,
    amenities,
    description,
    category_type,
    address_no,
    street,
    city,
    state,
    floor,
    no_flatmate,
    pet_allowed,
    prefered_flatmate,
    amount,
  } = req.body;
  try {
    if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (err) {
        return res.status(400).json({ message: "Invalid amenities JSON" });
      }
    }

    const checkCat = await category.findOne({ category_type: category_type });

    const checkUser = await user.findOne({ email: email });

    if (!checkCat) throw new Error(messages.CATEGORY_NOT_FOUND);
    if (!checkUser) {
      throw new Error(messages.USER_NOT_FOUND);
    }

    const imageUrl =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

      if(checkUser.is_email_verified === false){
        throw new Error(messages.EMAIL_NOT_VERIFIED);
      }

    if (checkUser.is_agent === false) {
      throw new Error(messages.NOT_AN_AGENT);
    }
    if (checkUser.post_count === 0 ) {
      throw new Error(messages.LIMIT_REACHED);
    }

    const apartmentData = {
      apartment_id: uuidv4(),
      category_id: checkCat.category_id,
      user_id: checkUser.user_id,
      amenities: parsedAmenities,
      description: description,
      apartment_type: type,
      apartment_address_no: address_no,
      apartment_street_name: street,
      apartment_city: city,
      apartment_state: state,
      apartment_floor: floor,
      apartment_flatname_count: no_flatmate,
      apartment_prefered_flatmate: prefered_flatmate,
      apartment_amount: amount,
      apartment_image: imageUrl,
      is_allowed_pet: pet_allowed,
    };

    const newApartment = await apartment.create(apartmentData);
    const newPost_count = checkUser.post_count - 1;
    await user.updateOne(
      { user_id: checkUser.user_id },
      { $set: { post_count: newPost_count ,  tier_type: determineTierType(newPost_count) } } 
    );
    
    
    res.status(201).json({
      message: messages.APARTMENT_CREATED,
      data: newApartment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteApartment = async (req, res) => {
  try {
    const { apartment_id } = req.params;
    const { email } = req.params;
    const checkUser = await user.findOne({ email: email });
    if (!checkUser) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    if (checkUser.is_agent === false) {
      throw new Error(messages.NOT_AN_AGENT);
    }
    const findApartment = await apartment.findOne({
      apartment_id: apartment_id,
    });
    if (!findApartment) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }

    if (findApartment.user_id !== checkUser.user_id) {
      throw new Error(messages.NOT_AUTHORIZED);
    }

    const imageDelete = findApartment.apartment_image.map(
      async (img) => {
        if (img.public_id) {
          return cloudinary.uploader.destroy(img.public_id);
        }
      }
    );

    await Promise.all(imageDelete);
    const deletedApartment = await apartment.deleteOne({
      apartment_id: apartment_id,
    });
    res.status(200).json({
      message: messages.APARTMENT_DELETED,
      data: deletedApartment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllApartment,
  getSingleApartment,
  postApartment,
  deleteApartment,
};
