const handleError = require("./handleError");
// https://jasonwatmore.com/post/2020/07/22/nodejs-express-api-request-schema-validation-with-joi
module.exports = function (req, res, next, schema, element = "body") {
  const options = {
    convert: true,
    abortEarly: false, // incluír todos los errores
    stripUnknown: true, // eliminar los unknown
  };
  const { error, value } = schema.validate(req[element], options);

  // Si solo se está probando el esquema retornar el resultado de la validación
  // y se sabe que se estla probando el esquema si next no está definido
  if (!next)
    return {
      error: error
        ? `Validation error: ${error.details.map((x) => x.message).join(", ")}`.replace(/\"/g, "'")
        : false,
      value,
    };

  if (error)
    return handleError(
      res,
      `Validation error: ${error.details.map((x) => x.message).join(", ")}`.replace(/\"/g, "'")
    );

  req[element] = value;
  next();
};
