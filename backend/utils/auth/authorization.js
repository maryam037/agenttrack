const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const checkActiveStatus = (req, res, next) => {
  if (req.user.status !== "active") {
    return res.status(403).json({ error: "Account is inactive" });
  }
  next();
};

module.exports = { authorizeAdmin, checkActiveStatus };