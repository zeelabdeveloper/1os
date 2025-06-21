const Joi = require("joi");

const validateDepartment = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    code: Joi.string().required().uppercase().trim(),
    branch: Joi.string().required(),
    head: Joi.string().allow(null),
   
    isActive: Joi.boolean()
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateDepartment };