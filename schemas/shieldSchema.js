const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
const { acceptedCoinsNames } = require("../utils/constants");

module.exports = (req, res, next) => {
  const schema = Joi.object({
    coin: Joi.string()
      .valid(...acceptedCoinsNames)
      .required(),
  });
  const testResult = validateRequest(req, res, next, schema, "query");

  if (!next) return testResult;
};
