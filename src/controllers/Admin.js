const admin = require("../model/admin");
const apartment = require("../model/apartment");
const category = require("../model/category");
const user = require("../model/user");
const transaction = require("../model/transaction");
const { v4: uuidv4 } = require("uuid");
const Otp = require("../model/otp");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/email_service");
const messages = require("../messages/index");
const cloudinary = require("cloudinary");
const auditLog = require("../model/auditLog");
const {
  comparePassword,
  saltAndHashPassword,
  generateOtp,
  generateRandomPassword,
} = require("../utils/index");

const AdmingetAllApartment = async (req, res) => {
  try {
    
    const apartmentData = await apartment.find({});
    
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Viewed All Apartments",
      target: "Admin",
      details: "Viewed All Apartments",
      ip_address: req.ip,
    });

    res.status(200).json({
      message: messages.ALL_APARTMENTS,
      data: apartmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AdmingetSingleApartment = async (req, res) => {
  try {
    const { apartment_id} = req.params;
    const apartmentData = await apartment.findOne({
      apartment_id: apartment_id,
    });
    if (!apartmentData) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }
  
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Viewed Single Apartment",
      target: "Admin",
      details: "Viewed Single Apartment",
      ip_address: req.ip,
    })

    
    res.status(200).json({
      message: messages.SINGLE_APARTMENT,
      data: apartmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    

    const existingAdmin = await admin.findOne({ email });

    if (existingAdmin) {
      throw new Error(messages.ADMIN_ALREADY_EXISTS);
    }
    
    const randomPassword = generateRandomPassword();
    const { salt, hashedPassword } = await saltAndHashPassword(randomPassword);
    const newAdminId = uuidv4();
    await admin.create({
      admin_id: newAdminId,
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      password_salt: salt,
      phone,
      address,
    });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Created Admin",
      target: newAdminId,
      details: {
        admin_id: newAdminId,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone: phone,
        address: address,
      },
      ip_address: req.ip,
    });
    await sendEmail(email, "Account Created", {  
    password: randomPassword,
    first_name,
    role: "admin",
    login_url: "http://localhost:3000/login",
    year: new Date().getFullYear()
  }, "passwordReset");
    res.status(201).json({
      message: messages.ADMIN_CREATED,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkAdmin = await admin.findOne({ email });
    const isPasswordValid = await comparePassword(
      password,
      checkAdmin.password_hash
    );
    if (!isPasswordValid || !checkAdmin) {
      throw new Error(messages.INVALID_CREDENTIALS);
    }

    const payload = {
      email: checkAdmin.email,
      id: checkAdmin.admin_id,
      role: checkAdmin.role,
    };
  

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP },
      (err, token) => {
        if (err) {
          throw new Error(err.message);
        }
        res.setHeader("Authorization", token);
        res.status(200).json({
          message: messages.LOGIN_SUCCESSFUL,
          status: true,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const adminUploadProfileImage = async (req, res) => {
  try {

    const { admin_id } = req.admin;
    const checkAdmin = await admin.findOne({ admin_id });
    if (!checkAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }
    const imageUrl = req.file
      ? {
          url: req.file.path,
          public_id: req.file.filename,
        }
      : null;
    await admin.updateOne(
  { admin_id }, 
  { $set: { image: imageUrl } } 
);
    res.status(200).json({
      message: messages.ADMIN_IMAGE_UPDATED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 

const getAdminProfile = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const checkAdmin = await admin.findOne({ admin_id }).select("-password_hash -password_salt");
    if (!checkAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }

     await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id, 
      action: "Viewed admin profile",
      target: admin_id,
      details: {
        viewer_email: req.admin.email,
        viewed_email: checkAdmin.email,
      },
      ip_address: req.ip,
    });
    res.status(200).json({
      message: messages.ADMIN_PROFILE,
      data: checkAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await admin.find({}).select("-password_hash -password_salt");
    res.status(200).json({
      message: messages.ALL_ADMINS,
      data: admins,
    });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id, 
      action: "Viewed all admins",
      details: {
        viewer_email: req.admin.email,
      },
      ip_address: req.ip,
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;
    const checkAdmin = await admin.findOne({ admin_id });
    if (!checkAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }
if (req.admin.admin_id === admin_id) {
  return res.status(403).json({ message: "You cannot update yourself here" });
}
    const updateAdmin = await admin.updateOne(
      { admin_id },
      {
        $set: {
          first_name,
          last_name,
          email,
          phone,
          address,
        },
      }
    );

    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Updated Admin",
      target: admin_id,
      details: {
        admin_id: admin_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone: phone,
        address: address,
      },
      ip_address: req.ip,
    })
    res.status(201).json({
      message: messages.ADMIN_UPDATED,
      data: updateAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const adminResetAdminPassword = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const existingAdmin = await admin.findOne({ admin_id });
    if (!existingAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }
    const randomPassword = generateRandomPassword();
    const { salt, hashedPassword } = await saltAndHashPassword(randomPassword);
    await admin.updateOne(
      { admin_id },
      {
        $set: {
          password_hash: hashedPassword,
          password_salt: salt,
        },
      }
    );

    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Reset admin password",
      target: admin_id,
      details: {
        admin_id: admin_id,
        email: existingAdmin.email,
      },
      ip_address: req.ip,
    })
    await sendEmail(existingAdmin.email, "Password Reset", {  
    password: randomPassword,
    name: existingAdmin.first_name,
    role: "admin",
    login_url: "http://localhost:3000/login",
    year: new Date().getFullYear()
  }, "passwordReset");
    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const checkAdmin = await admin.findOne({ admin_id });
    if (!checkAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }
    await admin.deleteOne({ admin_id });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Deleted admin",
      target: admin_id,
      details: {
        admin_id: admin_id,
        email: checkAdmin.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.ADMIN_DELETED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const {admin_id} = req.admin;
    const { oldPassword, newPassword } = req.body;

    const checkDBForPassword = await admin.findOne({ admin_id });
    const checkIfPasswordIsCorrect = await comparePassword(
      oldPassword,
      checkDBForPassword.password_hash
    );

    if (checkIfPasswordIsCorrect === false) {
      throw new Error("Incorrect password");
    }
    if (newPassword === oldPassword) {
      throw new Error("New password cannot be same as old password");
    }

    const { salt, hashedPassword } = await saltAndHashPassword(newPassword);

    await admin.updateOne(
      { admin_id },
      {
        $set: {
          password_hash: hashedPassword,
          password_salt: salt,
        },
      }
    );
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};

const startAdminForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new Error(messages.EMAIL_REQUIRED);
    }
    const checkAdmin = await admin.findOne({ email });
    if (!checkAdmin) {
      throw new Error(messages.ADMIN_NOT_FOUND);
    }
    const otpcode = generateOtp();
    
    await Otp.create({
      email,
      otp: otpcode,
      otp_expires: new Date(Date.now() + 3 * 60 * 1000),
    });

    await sendEmail(email, "Reset password", {otp: otpcode }, "resetPassword");
    res.status(200).json({
      message: "Otp sent successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try{
    const {email} =req.params;
    const otpRecord = await Otp.findOne({email});
    if(otpRecord.otp_expires > new Date()){
      await sendEmail(email, "Reset password", {otp: otpRecord.otp }, "resetPassword");
      return  res.status(200).json({
        message: "Otp resent successfully",
      });
    }
     const otpCode = generateOtp();
      await Otp.deleteMany({email});
      await Otp.create({
        email,
        otp: otpCode,
        otp_expires: new Date(Date.now() + 3 * 60 * 1000),
      });

      await sendEmail(email, "Reset password", {otp: otpCode }, "resetPassword");
      res.status(200).json({
        message: "Otp resent successfully",
      });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

const completeForgetPassword = async (req, res) => {
  try{
    const {otp, email} = req.params;
    const{newPassword,confirmPassword} = req.body;
    const otpRecord = await Otp.findOne({email});
    if(otpRecord.otp !== otp && otpRecord.email !== email){
      throw new Error(messages.INVALID_OTP);
    }
    if(otpRecord.otp_expires < new Date()){
      throw new Error(messages.OTP_EXPIRED);
    }
    if(newPassword !== confirmPassword){
      throw new Error(messages.PASSWORD_MISMATCH);
    }
    const { salt, hashedPassword } = await saltAndHashPassword(newPassword);
    await admin.updateOne({email},{$set:{password_hash: hashedPassword, password_salt: salt}});
    await Otp.deleteMany({email});
    res.status(200).json({
      message: "Password changed successfully",
    });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}
  
 

const adminCreateUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone,address } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      throw new Error(messages.USER_ALREADY_EXISTS);
    }

    const randomPassword = generateRandomPassword();
    const { salt, hashedPassword } = await saltAndHashPassword(randomPassword);
    const user_id = uuidv4();
    await user.create({
      user_id,
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      password_salt: salt,
      phone,
      address
    });
 await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Created User",
      target: user_id,
      details: {
        user_id: user_id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        address: address
      },
      ip_address: req.ip,
    });
    
    await sendEmail(email, "Your Password", { password: randomPassword }, "resetPassword");
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminResetUserPassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const existingUser = await user.findOne({ user_id });
    if (!existingUser) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    const generateRandomPassword = generateRandomPassword();
    const { salt, hashedPassword } = await saltAndHashPassword(randomPassword);
    await user.updateOne(
      { user_id },
      {
        $set: {
          password_hash: hashedPassword,
          password_salt: salt,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Reset User Password",
      target: user_id,
      details: {
        email: existingUser.email,
      },
      ip_address: req.ip,
    })
    await sendEmail(
      existingUser.email,
      "Your Password",
      { Password: randomPassword },
      "resetPassword"
    );
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminGetAllUsers = async (req, res) => {
  try {
    const userData = await user.find({});
    res.status(200).json({
      message: messages.ALL_USERS,
      data: userData,
    });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Get All Users",
      details: {},
      target: "All Users",
      ip_address: req.ip,
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminGetSingleUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = await user.findOne({ user_id });
    if (!userData) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    res.status(200).json({
      message: messages.SINGLE_USER,
      data: userData,
    });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Get Single User",
      target: user_id,
      details: {
        email: userData.email,
      },
      ip_address: req.ip,
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminSuspendUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = await user.findOne({ user_id });
    if (!userData) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    await user.updateOne(
      { user_id },
      {
        $set: {
          is_active: false,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Suspend User",
      target: user_id,
      details: {
        email: userData.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.USER_SUSPENDED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminUnsuspendUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = await user.findOne({ user_id });
    if (!userData) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    await user.updateOne(
      { user_id },
      {
        $set: {
          is_active: true,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Unsuspend User",
      target: user_id,
      details: {
        email: userData.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.USER_UNSUSPENDED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminDiableApartmentPost = async (req, res) => {
  try {
    const { apartment_id } = req.params;
    const postData = await apartment.findOne({ apartment_id });
    if (!postData) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }
    await apartment.updateOne(
      { apartment_id },
      {
        $set: {
          is_available: false,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Disable Apartment Post",
      target: postData.user_id,
      details: {},
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.APARTMENT_DISABLED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminEnableApartmentPost = async (req, res) => {
  try {
    const { apartment_id } = req.params;
    const postData = await apartment.findOne({ apartment_id });
    if (!postData) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }
    await apartment.updateOne(
      { apartment_id },
      {
        $set: {
          is_available: true,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Enable Apartment Post",
      target: postData.user_id,
      details: {},
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.APARTMENT_ENABLED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const adminDisableUserPost = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = await user.findOne({ user_id });
    if (!userData) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    await user.updateOne(
      { user_id },
      {
        $set: {
          disable_post: true,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Disable User Post",
      target: user_id,
      details: {
        email: userData.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.USER_DISABLED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminEnableUserPost = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userData = await user.findOne({ user_id });
    if (!userData) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    await user.updateOne(
      { user_id },
      {
        $set: {
          disable_post: false,
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Enable User Post",
      target: user_id,
      details: {
        email: userData.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.USER_ENABLED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminSubcribeForUser = async (req, res) => {
  const tierMap = {
  1000000: { tier_type: "pro", post_count: 15 },
  500000: { tier_type: "standard", post_count: 10 },
  100000: { tier_type: "basic", post_count: 5 },
};
  const {  email } = req.params;
  const { amount } = req.body;

  try {
    const selectedTier = tierMap[amount];
    if (!selectedTier){
      throw new Error("Invalid amount selected");
    };

    const checkUser = await user.findOne({ email });
    if (!checkUser) {
      throw new Error("User does not exist");
    };
     const paymentRef= uuidv4();
    const update = {
      $inc: { post_count: selectedTier.post_count },
      $set: {
        tier_type: selectedTier.tier_type,
        is_agent: true,
      },
      $push: {
        tier_history: {
          tier_type: selectedTier.tier_type,
          amount: amount / 100,
          post_count_added: selectedTier.post_count,
          payment_reference: paymentRef,
        },
      },
    };

    await user.updateOne({ email }, update);

    await transaction.create({
      transaction_id: uuidv4(),
      user_id: checkUser.user_id,
      tier_type: selectedTier.tier_type,
      amount: amount / 100,
      payment_reference: paymentRef,
      transaction_status: "success",
    });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Subscribe User",
      target: checkUser.user_id,
      details: {
        email: checkUser.email,
      },
      ip_address: req.ip,
    })

    res.status(200).json({ message: `Tier '${selectedTier.tier_type}' assigned to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const  adminCreateCategory = async (req, res) => {
const { category_type } = req.body;
  
  try {
    const categoryData = await category.findOne({ category_type });
    if (categoryData) {
      throw new Error(messages.CATEGORY_EXISTS);
    }

    await category.create({
      category_id: uuidv4(),
      category_type: category_type,
    });
    res.status(201).json({
      status: true,
      message: messages.CATEGORY_CREATED,
      data: { category_type },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    
  }
}

const adminPostApartmentForUser = async (req, res) => {
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
    // Parse amenities if it's a JSON string
    let parsedAmenities = amenities;
    if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (err) {
        return res.status(400).json({ message: "Invalid amenities JSON" });
      }
    }

    const checkUser = await user.findOne({ email });
    const checkCat = await category.findOne({ category_type });

    if (!checkUser) throw new Error(messages.USER_NOT_FOUND);
    if (!checkCat) throw new Error(messages.CATEGORY_NOT_FOUND);
    if (!checkUser.is_email_verified) throw new Error(messages.EMAIL_NOT_VERIFIED);
    if (!checkUser.is_agent) throw new Error(messages.NOT_AN_AGENT);
    if (checkUser.post_count === 0) throw new Error(messages.LIMIT_REACHED);

    const imageUrl = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })) || [];

    const apartmentData = {
      apartment_id: uuidv4(),
      category_id: checkCat.category_id,
      user_id: checkUser.user_id,
      amenities: parsedAmenities,
      description,
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

    const newPostCount = checkUser.post_count - 1;

    await user.updateOne(
      { user_id: checkUser.user_id },
      {
        $set: {
          post_count: newPostCount,
          tier_type: determineTierType(newPostCount),
        },
      }
    );
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Post Apartment",
      target: checkUser.user_id,
      details: {
        email: checkUser.email,
      },
      ip_address: req.ip,
    })

    res.status(201).json({
      message: messages.APARTMENT_CREATED,
      data: newApartment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const adminDeleteApartment = async (req, res) => {
  try {
    const { apartment_id } = req.params;
    const findApartment = await apartment.findOne({ apartment_id });
    if (!findApartment) {
      throw new Error(messages.APARTMENT_NOT_FOUND);
    }
    const imageDelete = findApartment.apartment_image.map(
          async (img) => {
            if (img.public_id) {
              return cloudinary.uploader.destroy(img.public_id);
            }
          }
        );
    
        await Promise.all(imageDelete);
    await apartment.deleteOne({ apartment_id });
    await auditLog.create({
      auditLog_id: uuidv4(),
      action_by: req.admin.admin_id,
      action: "Delete Apartment",
      target: findApartment.user_id,
      details: {
        email: findApartment.email,
      },
      ip_address: req.ip,
    })
    res.status(200).json({
      message: messages.APARTMENT_DELETED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createAdmin,
  AdmingetSingleApartment,
  AdmingetAllApartment,
  AdminLogin,
  updateAdmin,
  adminResetAdminPassword,
  deleteAdmin,
  changeAdminPassword,
  startAdminForgetPassword,
  resendOtp,
  completeForgetPassword,
  adminGetAllUsers,
  adminGetSingleUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminDiableApartmentPost,
  adminEnableApartmentPost,
  adminDisableUserPost,
  adminEnableUserPost,
  adminSubcribeForUser,
  adminResetUserPassword ,
  adminCreateUser,
  adminUploadProfileImage,
  getAdminProfile,
  getAdmins,
  adminPostApartmentForUser,
  adminDeleteApartment,
  adminCreateCategory


};
