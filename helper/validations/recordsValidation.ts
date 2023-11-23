const { check } = require("express-validator");
const { validationErrorHandler } = require("../global");

export const recordGetValidate = [validationErrorHandler];
export const recordIdValidation = [
  check("recordId")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Record Id is Required."),
  validationErrorHandler,
];

export const recordValidate = [
  check("doctor")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Doctor's name is Required!"),

  check("hospital").notEmpty().withMessage("Hospital Name is Required."),
  check("hospitalAddress").notEmpty().withMessage("HospitalAddress is required."),
 
  check("illness").notEmpty().withMessage("illness is required."),
  check("categoryOfIllness").notEmpty().withMessage("Category Of Illness is required."),
  check("illnessStatus").notEmpty().withMessage("illness Status is required."),
  check("priority").notEmpty().withMessage("Priority is required."),
  check("instructions")
    .notEmpty()
    .withMessage("We Need a Proper Instructions to maintain your records.")
    .isLength({ min: 30, max: 500 })
    .withMessage("Minimum Length should be 30 and Maximum 500."),

  check("medications").isLength({ min: 30, max: 500 }).withMessage("Minimum Length should be 30 and Maximum 500."),

  validationErrorHandler,
];
