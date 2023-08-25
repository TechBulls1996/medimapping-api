const { check } = require("express-validator");
const { validationErrorHandler } = require("../global");

export const requestGetValidate = [validationErrorHandler];
export const requestIdValidation = [
  check("requestId")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Request Id is Required."),
  validationErrorHandler,
];
export const requestValidate = [
  // username must be an email
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address!"),

  check("name")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Full Name is Required."),

  check("phone")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Valid Phone Number is Required.")
    .isLength({ min: 10 }),

  check("age").notEmpty().withMessage("Age is required."),
  check("bloodGroup").notEmpty().withMessage("Blood Group is required."),
  check("bloodType").notEmpty().withMessage("Blood Type is required."),
  check("bloodUnit").notEmpty().withMessage("Blood Unit is required."),
  check("time").notEmpty().withMessage("Urgency is required."),
  check("country").notEmpty().withMessage("Country is required."),
  check("state").notEmpty().withMessage("State is required."),
  check("city").notEmpty().withMessage("City is required."),
  check("hospital").notEmpty().withMessage("Hospital Name is required."),
  check("hospitalAddress").notEmpty().withMessage("Address is required."),
  check("pinCode").notEmpty().withMessage("PinCode is required."),
  check("desc")
    .notEmpty()
    .withMessage("We Need a Good Description to attract Donars ASAP.")
    .isLength({ min: 30, max: 500 })
    .withMessage("Minimum Length should be 30 and Maximum 500."),

  validationErrorHandler,
];
