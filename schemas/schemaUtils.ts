import Joi from "joi";
import { NextFunction } from "express";
import validateRequest from "../utils/validateRequest";
import CommonRequest from "../types/commonRequest.type";
import CommonResponse from "../types/commonResponse.type";

export const validIDs =
  (db: Collection<any>) =>
  (id: number, { error }: Joi.CustomHelpers<any>) => {
    const valids = db.find().map(({ $loki }) => $loki);
    return valids.includes(id) ? id : error("any.only", { valids });
  };

export const a =
  (schema: Joi.Schema, element?: "body" | "header" | "query") =>
  (req: CommonRequest, res: CommonResponse, next: NextFunction) =>
    validateRequest(req, res, next, schema, element);

export const optionalArrayWithAllIDsOfDB = (db: Collection<any>) =>
  Joi.when(Joi.ref("."), {
    is: Joi.array(),
    then: Joi.array()
      .min(1)
      .unique()
      .items(Joi.number().custom(validIDs(db))),

    // If it is only one value, it will be converted to number, verified and then converted to an array
    otherwise: Joi.number()
      .custom(validIDs(db))
      .custom((value) => [value]),
  });
