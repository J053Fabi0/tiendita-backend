import Joi from "joi";
import { NextFunction } from "express";
import handleError from "./handleError";
import CommonRequest from "../types/commonRequest.type";
import CommonResponse from "../types/commonResponse.type";

// https://jasonwatmore.com/post/2020/07/22/nodejs-express-api-request-schema-validation-with-joi
export default function validateRequest(
  req: CommonRequest,
  res: CommonResponse,
  next: NextFunction | undefined,
  schema: Joi.Schema,
  element: "body" | "header" | "query" = "body"
) {
  const options = {
    convert: true,
    abortEarly: true, // incluír todos los errores
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
    return handleError(res, {
      description: `Validation error: ${error.details.map((x) => x.message).join(", ")}`.replace(/\"/g, "'"),
      details: error.details,
    });

  req[element] = value;
  next();
}
