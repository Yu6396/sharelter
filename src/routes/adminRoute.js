const router = require("express").Router();
const { AdminAuthorization } = require("../middlewares/authorization");
const checkRole = require("../middlewares/checkRole");
const {
  createAdmin,
  AdmingetSingleApartment,
  AdmingetAllApartment,
  AdminLogin,
  updateAdmin,
  adminResetAdminPassword,
  deleteAdmin,
  changeAdminPassword,
  startAdminForgetPassword,
  completeForgetPassword,
  resendOtp,
  adminGetAllUsers,
  adminGetSingleUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminDiableApartmentPost,
  adminEnableApartmentPost,
  adminDisableUserPost,
  adminEnableUserPost,
  adminSubcribeForUser,
  adminResetUserPassword,
  adminCreateUser,
  adminUploadProfileImage,
  getAdminProfile,
  getAdmins,
  adminPostApartmentForUser,
    adminDeleteApartment,
    adminCreateCategory
} = require("../controllers/Admin");
const upload = require("../middlewares/upload");

router.post(
  "/create/admin",
  AdminAuthorization,
  checkRole("super-admin"),
  createAdmin
);
router.post("/login", AdminLogin);
router.patch(
  "/upload/profile/image",
  AdminAuthorization,
  upload.single("image"),
  adminUploadProfileImage
);
// const

router.get("/get/admin/profile/:admin_id", AdminAuthorization,checkRole("super-admin"), getAdminProfile);
router.get("/get/all/admin", AdminAuthorization, checkRole("super-admin"), getAdmins);

router.get(
  "/get/single/apartment/:apartment_id",
  AdminAuthorization,
  AdmingetSingleApartment
);
router.get("/get/all/apartment", AdminAuthorization, AdmingetAllApartment);
router.get("/get/all/users", AdminAuthorization, adminGetAllUsers);
router.get("/get/single/user/:user_id", AdminAuthorization, adminGetSingleUser);

router.post("/suspend/user/:user_id", AdminAuthorization, adminSuspendUser);
router.post("/unsuspend/user/:user_id", AdminAuthorization, adminUnsuspendUser);

router.post(
  "/disable/apartment/post/:apartment_id",
  AdminAuthorization,
  adminDiableApartmentPost
);
router.post(
  "/enable/apartment/post/:apartment_id",
  AdminAuthorization,
  adminEnableApartmentPost
);
router.post(
  "/disable/user/post/:user_id",
  AdminAuthorization,
  adminDisableUserPost
);
router.post(
  "/enable/user/post/:user_id",
  AdminAuthorization,
  adminEnableUserPost
);

router.post("/subscribe/user/:user_id", AdminAuthorization, adminSubcribeForUser);

router.post("/reset/user/password/:user_id", AdminAuthorization, adminResetUserPassword);
router.post("/reset/admin/password/:admin_id", AdminAuthorization,checkRole("super-admin"), adminResetAdminPassword);

router.post("/create/user", AdminAuthorization, adminCreateUser);

router.patch("/update/admin/:admin_id", AdminAuthorization,checkRole("super-admin"), updateAdmin);
router.delete("/delete/admin/:admin_id", AdminAuthorization,checkRole("super-admin"), deleteAdmin);
router.patch("/change/admin/password", AdminAuthorization, changeAdminPassword);
router.get("/start/forget/password", startAdminForgetPassword);
router.post("/resend/otp/:email", resendOtp);
router.patch("/complete/forget/password/:email/:otp", completeForgetPassword);
router.post("/post/apartment/:user_id", AdminAuthorization,upload.array("images", 10), adminPostApartmentForUser);
router.delete("/delete/apartment/:apartment_id", AdminAuthorization, adminDeleteApartment);
router.post("/create/category", AdminAuthorization, adminCreateCategory);


module.exports = router;
