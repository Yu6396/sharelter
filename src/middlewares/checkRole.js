
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const { admin } = req;

      if (!admin || !allowedRoles.includes(admin.role.toLowerCase())) {
        return res.status(403).json({
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};

module.exports = checkRole;
