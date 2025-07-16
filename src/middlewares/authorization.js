const jwt = require("jsonwebtoken");
const user = require("../model/user");
const admin = require("../model/admin");


const UserAuthorization = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({
      message: "You are not authorized",
    });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      return res.status(400).json({
        message: "You are not authorized",
      });
    }
    const checkDB = await user.findOne({ email: decoded.email });

    req.params.user_id = checkDB.user_id;
    req.params.email = checkDB.email;

    next();
  });
};

const AdminAuthorization = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied, token missing." });
    }

    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded){
      if (err || !decoded) {
        return res.status(403).json({ message: "Access denied, invalid token." });
      }
       const admincheck = ["admin", "super-admin"];
      const checkDB = await admin.findOne({ email: decoded.email });
    
      if (!checkDB || !admincheck.includes(checkDB.role.toLowerCase())) {
        return res.status(403).json({ message: "Access denied, not an admin." });
      }
      
      
      req.admin = checkDB;
      // req.params.admin_id = checkDB.admin_id;
      // req.params.email = checkDB.email;

      next(); 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const  blockUserPost =async (req, res, next) => {
  const userexist = await user.findOne({ email: req.params.email });
  if (userexist.disable_post === true) {
    return res.status(403).json({ message: 'Posting is disabled, contact support' });
  }
  next();
};

 const blockSuspendedUsers = async (req, res, next) => {
  const userexist = await user.findOne({ email: req.body.email });
  if (userexist.is_active === false) {
    return res.status(403).json({ message: 'Your account is suspended, contact support' });
  }
  next();
};

module.exports = { UserAuthorization ,AdminAuthorization,blockSuspendedUsers,blockUserPost};
