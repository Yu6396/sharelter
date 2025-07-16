const router = require("express").Router();
const {postApartment, getAllApartment, getSingleApartment,  deleteApartment} = require("../controllers/apartment");
const { UserAuthorization,blockUserPost } = require("../middlewares/authorization");
const upload = require("../middlewares/cloudinaryStorage");

router.post("/post/", UserAuthorization,blockUserPost,upload.array("images", 10), postApartment);
router.get("/get/all", getAllApartment);
router.get("/get/single/:apartment_id", getSingleApartment);

router.delete("/delete/:apartment_id", UserAuthorization, deleteApartment);
// const


module.exports = router