const { body, param, query } = require("express-validator");

const reviewValidation = [
  body("reviewText").notEmpty().isLength({ max: 1000 }),
  body("rating").isFloat({ min: 1, max: 5 }),
  body("location").notEmpty()
];

const userValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 })
];

module.exports = { reviewValidation, userValidation };