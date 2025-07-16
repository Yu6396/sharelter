const Joi = require("joi")


const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .pattern(new RegExp("(?=.*[a-z])")) 
  .pattern(new RegExp("(?=.*[A-Z])")) 
  .pattern(new RegExp("(?=.*[0-9])")) 
  .pattern(new RegExp("(?=.*[!@#$%^&*])")) 
  .required()
  .messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 30 characters",
    "string.pattern.base": "Password must contain upper and lower case letters, numbers, and special characters",
  });


const createAdminSchema = Joi.object({
  admin_id: Joi.string().optional(), 
  firstName: Joi.string().max(20).required(),
  lastName: Joi.string().max(20).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required(),
  password: passwordSchema,
  phone: Joi.string().optional().min(11).max(11),

});
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: passwordSchema,
})

const changePasswordSchema = Joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
})

const updateAdminSchema = Joi.object({
  firstName: Joi.string().max(20).optional(),
  lastName: Joi.string().max(20).optional(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .optional(),
  phone: Joi.string().optional().min(11).max(11),
  address: Joi.string().optional(),
})

module.exports = { createAdminSchema, loginSchema, changePasswordSchema, updateAdminSchema }