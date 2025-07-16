const express = require("express")
const router = express.Router()
const { UserAuthorization,blockSuspendedUsers} = require("../middlewares/authorization")
const { createUser, verifyUser, resendOtp, loginUser, changePassword, startForgetPassword, completeForgetPassword, startPayment, confirmPayment, agentUploadProfileImage} = require("../controllers/user")
const validationmiddleware = require("../middlewares/validationMiddleware")
const { createUserSchema,  changePasswordSchema } = require("../validations/userValidation")
const upload = require("../middlewares/cloudinaryStorage")


router.post("/create",validationmiddleware(createUserSchema), createUser)


router.post("/login",blockSuspendedUsers, loginUser),
router.patch("/change/password/:user_id",UserAuthorization,validationmiddleware(changePasswordSchema),changePassword)
router.get("/start/forget/password", startForgetPassword)
router.patch("/complete/forget/password/:email/:otp", completeForgetPassword)
router.get("/verify/:email/:otp", verifyUser)
router.get("/resend/otp/:email", resendOtp)
router.post("/start-payment",UserAuthorization, startPayment);
router.get("/complete-payment/:reference",UserAuthorization, confirmPayment);
router.post("/upload/profile/image",UserAuthorization,upload.single("image"), agentUploadProfileImage)



module.exports = router
