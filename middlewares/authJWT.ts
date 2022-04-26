import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import handleError from "../utils/handleError";
import CommonRequest from "../types/commonRequest.type";
import { personsDB } from "../db/collections/collections";
import CommonResponse from "../types/commonResponse.type";

const authJWT =
  (shouldBeEnabled: boolean, permitIfNoAdmin: boolean = false) =>
  (req: CommonRequest, res: CommonResponse, next: NextFunction) => {
    // If testing, run next()
    if (process.env.NODE_ENV === "test" && req.headers.authorization === "testing") return next();

    // If there are no admins, everything is permitted to anyone
    if (permitIfNoAdmin && personsDB.count({ role: "admin" }) === 0) return next();

    jwt.verify(
      req.headers.authorization || "",

      process.env.API_SECRET as string, //

      (error, decode) => {
        if (error) return handleError(res, "Invalid JWT token", 403);

        const person = personsDB.findOne({ $loki: (decode as jwt.JwtPayload).id });

        if (!person) return handleError(res, "User not found", 404);
        if (shouldBeEnabled && !person.enabled) return handleError(res, "User disabled", 401);

        const { password: _, meta: __, $loki: id, ...userData } = person;
        req.body.person = { ...userData, id };
        next();
      }
    );
  };

/**
 * If there are no admins, it does no authentication and permits everything.
 */
export const authIfNoAdmin = authJWT(false, true);

/**
 * Only permits accounts thar are enabled.
 */
export const authJWTEnabled = authJWT(true);

/**
 * Permits every kind of account, even deleted ones.
 */
export const authJWTAll = authJWT(false);
