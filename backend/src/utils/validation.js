const { body, param, query } = require("express-validator");

const phoneRegex = /^\+1\d{10}$/;

const validatePhone = (field = "phone_number") =>
  body(field)
    .matches(phoneRegex)
    .withMessage("Phone number must be in E.164 format: +1XXXXXXXXXX");

const validateEmail = (field = "email") =>
  body(field).isEmail().normalizeEmail().withMessage("Valid email required");

const validatePassword = (field = "password") =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters");

const validateUUID = (field = "id") =>
  param(field).isUUID(4).withMessage("Invalid ID format");

const validatePagination = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const validatePropertyType = (field = "property_type") =>
  body(field)
    .optional()
    .isIn(["single_family", "condo", "townhouse", "multi_family", "land", "other"])
    .withMessage("Invalid property type");

module.exports = {
  validatePhone,
  validateEmail,
  validatePassword,
  validateUUID,
  validatePagination,
  validatePropertyType,
};
