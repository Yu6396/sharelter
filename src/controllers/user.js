const User = require("../model/user");
const Otp = require("../model/otp");
const sendEmail = require("../services/email_service");
const { v4: uuidv4 } = require("uuid");
const {
  saltAndHashPassword,
  generateOtp,
  comparePassword,
  isEmpty,
} = require("../utils/index");
const jwt = require("jsonwebtoken");
const {
  initializePayment,
  verifyPayment,
} = require("../services/paystack_payment");
const transaction = require("../model/transaction");
const user = require("../model/user");
const messages = require("../messages");

const createUser = async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { salt, hashedPassword } = await saltAndHashPassword(password);
    const user_id = uuidv4();

    const user = await User.create({
      user_id,
      first_name,
      last_name,
      email,
      phone,
      password_hash: hashedPassword,
      password_salt: salt,
    });

    const otp = generateOtp();

    await sendEmail(email, "Your OTP", { otp: otp }, "otp");

    const otp_expires = new Date(Date.now() + 3 * 60 * 1000);
    await Otp.create({
      email: email,
      otp: otp,
      otp_expires: otp_expires,
    });

    res.status(201).json({
      message: "User created successfully, check email for otp",
      user,
    });
  } catch (error) {
    console.error("Create User error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyUser = async (req, res) => {
  const { email, otp } = req.params;

  try {
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otp_expires <= new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    await User.findOneAndUpdate({ email }, { is_email_verified: true });
    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });

    await sendEmail(
      email,
      "WELCOME HOME",
      { name: `${user.first_name} ${user.last_name}` },
      "welcome"
    );

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.params;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (otpRecord && otpRecord.otp_expires > new Date()) {
      await sendEmail(email, "Your OTP", { otp: otpRecord.otp }, "otp");

      return res.status(200).json({
        message: "OTP resent successfully",
      });
    }

    const newOtp = generateOtp();
    const newExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp: newOtp,
      otp_expires: newExpiresAt,
    });

    await sendEmail(email, "Your OTP", { otp: newOtp }, "otp");

    return res.status(200).json({
      message: "New OTP generated and sent",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkIfUserExists = await User.findOne({ email });

    if (checkIfUserExists === null) {
      throw new Error("User does not exist");
    }

    const isPasswordCorrect = await comparePassword(
      password,
      checkIfUserExists.password_hash
    );

    if (isPasswordCorrect === false) {
      throw new Error("Invalid password and email");
    }

    //   if (checkIfUserExists.is_email_verified === false) {
    //     throw new Error("Email not verified, Please verify your email")
    //   }

    const payload = {
      email: checkIfUserExists.email,
      id: uuidv4(),
    };
    console.log("i got hereeee:");

    console.log("payload:", payload);
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP },
      function (err, token) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Internal server error",
          });
        }
        res.setHeader("authorization", token);
        res.status(200).json({
          status: true,
          message: "Welcome onboard",
        });
      }
    );
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const checkDBForPassword = await User.findOne({ user_id });
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

    await User.updateOne(
      { user_id },
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
const startForgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const isEmailAvailable = await User.findOne({ email });
    console.log("isEmailAvailable:", isEmailAvailable);

    if (isEmpty(isEmailAvailable)) {
      throw new Error(messages.userNotFound);
    }
    const newOtp = generateOtp();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({ email, otp: newOtp, otp_expires: expiredAt });
    await sendEmail(email, "Reset password", { otp: newOtp }, "resetPassword");

    res.status(200).json({
      message: "Otp sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};
const completeForgetPassword = async (req, res) => {
  const { email, otp } = req.params;
  const { password,confirmPassword } = req.body;
  try {
    const isEmailAvailable = await Otp.findOne({ email, otp });

    if (isEmailAvailable.otp !== otp || isEmailAvailable.email !== email) {
      throw new Error(messages.wrongOtp);
    }

    if (isEmailAvailable.otp_expires <= new Date()) {
      throw new Error(messages.otpExpired);
    }

    if(password !== confirmPassword){
      throw new Error(messages.passwordMismatch);
    }
    const { salt, hashedPassword } = await saltAndHashPassword(password);
    await User.updateOne(
      { email },
      {
        $set: {
          password_hash: hashedPassword,
          password_salt: salt,
        },
      }
    );
    await Otp.deleteOne({ email: email });
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Something went wrong",
    });
  }
};

const updateUserProfile = async (req, res) => {
 try{
   const { user_id } = req.params;
  const {first_name,last_name,phone,address,email} = req.body;
  const checkIfUserExists = await User.findOne({ user_id });
  if (!checkIfUserExists) {
    throw new Error(messages.userNotFound);
  }
  await User.updateOne(
    { user_id },
    {
      $set: {
        first_name,
        last_name,
        phone,
        address,
        email
      },
    }
  );
  res.status(200).json({
    message: "Profile updated successfully",
  });
 }catch(error){
   res.status(400).json({
     message: error.message
   })
 }
}





const startPayment = async (req, res) => {
  // const tierPrices = {
  //   basic: 1000,
  //   standard: 5000,
  //   pro: 10000,
  // };
  const { email } = req.params;
  const { amount } = req.body;

  try {
    if (!email || !amount)
      return res.status(400).json({ message: "email and tier required" });

    // const amountToPay = tierPrices[tier];
    // if (!amountToPay) {
    //   throw new Error("Invalid tier selected");
    // }
    const response = await initializePayment(email, amount);
    console.log("response:", response);
    if (response.statusText !== "OK") {
      throw new Error("Payment initialization failed");
    }

    res.status(200).json({
      status: true,
      message: "Payment initialized successfully",
      data: response.data.data,
      extra: email,
    });
  } catch (err) {
    console.error("Payment Init Error:", err.message);
    res
      .status(500)
      .json({ message: err.message || "Could not initiate payment" });
  }
};
const agentUploadProfileImage = async (req, res) => {
  try {

    const { user_id } = req.params;
    const checkUser = await user.findOne({ user_id });
    if (!checkUser) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    const imageUrl = req.file
      ? {
          url: req.file.path,
          public_id: req.file.filename,
        }
      : null;
    await user.updateOne(
  { user_id }, 
  { $set: { image: imageUrl } } 
);
    res.status(200).json({
      message: messages.USER_IMAGE_UPDATED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  const { reference, email } = req.params;

  try {
    const tierMap = {
      1000000: { tier_type: "pro", post_count: 15 },
      500000: { tier_type: "standard", post_count: 10 },
      100000: { tier_type: "basic", post_count: 5 },
    };


    const existingTransaction = await transaction.findOne({
      payment_reference: reference,
    });
    if (existingTransaction) {
      throw new Error("Payment already confirmed");
    }

    const response = await verifyPayment(reference);
    const paymentData = response.data;

    // if (paymentData.status !== "success" || !paymentData.status) {
    //   throw new Error("Payment verification failed");
    // }

    const checkUser = await user.findOne({ email });
    if (!checkUser) throw new Error("User not found.");

    const amount = paymentData.amount; 
    const amountInNaira = amount / 100;

    const selectedTier = tierMap[amount];
    if (!selectedTier) {
      throw new Error("Unknown payment tier.");
    }
    const update = {
      $inc: { post_count: selectedTier.post_count },$set: { tier_type: selectedTier.tier_type },
      $push: {
        tier_history: {
          tier_type: selectedTier.tier_type,
          amount: amountInNaira,
          post_count_added: selectedTier.post_count,
          payment_reference: paymentData.reference,
          date: new Date(),
        },
      },
      $set: {
        is_agent: true,
      },
    };

    

    await user.updateOne({ email }, update);

    await transaction.create({
      transaction_id: uuidv4(),
      user_id: checkUser._id,
      tier_type: selectedTier.tier_type,
      amount: amountInNaira,
      payment_reference: paymentData.reference,
      transaction_status: paymentData.status,
    });

     res.status(200).json({
      message: "Payment verified and post count updated.",
    });
  } catch (err) {
    console.error("Payment Error:", err.message);
    res.status(500).json({
      message: err.message || "Something went wrong during verification.",
    });
  }
};

module.exports = confirmPayment;

module.exports = {
  createUser,
  verifyUser,
  resendOtp,
  loginUser,
  changePassword,
  startForgetPassword,
  completeForgetPassword,
  startPayment,
  confirmPayment,
  updateUserProfile,
  agentUploadProfileImage
  
};
