const Joi = require("joi");

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "any.required": "Username is required.",
      "string.empty": "Username cannot be empty.",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string().min(4).required().messages({
      "any.required": "Password is required.",
      "string.min": "Password must be at least 4 characters long.",
    }),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.required": "Confirm password is required.",
        "any.only": "Passwords do not match.",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required.",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  next();
};

module.exports = { validateRegistration, validateLogin };
