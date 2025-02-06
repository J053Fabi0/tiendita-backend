import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import handleError from "../utils/handleError";
import CommonRequest from "../types/commonRequest.type";
import { personsDB } from "../db/collections/collections";
import CommonResponse from "../types/commonResponse.type";
import PersonsDB from "../types/collections/personsDB.type";

/**
 *
 * @param onlyAdmins If only admins can access
 * @param permitIfNoAdmin If anyone can access in case there is no admin. Defaults to false.
 */
export const authJWT =
  (onlyAdmins: boolean, permitIfNoAdmin: boolean = false) =>
  (req: CommonRequest, res: CommonResponse, next: NextFunction) => {
    // If the demo is true, it will permit everything.
    if (process.env.DEMO === "true") {
      const person =
        personsDB.findOne() ||
        (personsDB.insertOne({
          ...{
            role: "admin",
            enabled: true,
            name: "Demo user",
            username: "demouser",
            password: bcrypt.hashSync("demouser", 10),
          },
        } as PersonsDB) as PersonsDB);
      const { password: _, meta: __, $loki: id, ...userData } = person;
      req.authPerson = { ...userData, id };
      return next();
    }

    // If there are no admins, everything is permitted to anyone
    if (permitIfNoAdmin && personsDB.count({ role: "admin" }) === 0) return next();

    const { authorization } = req.headers;
    const testing = process.env.NODE_ENV === "test" && typeof authorization === "string";
    jwt.verify(
      authorization || "",

      process.env.API_SECRET as string, //

      (error, decode) => {
        // Errors on decode will be ignored if testing
        if (error && !testing) return handleError(res, "Invalid JWT token", 403);

        // A person will always be added to the body if not testing, or if testing and authorization has the id.
        if (!testing || (testing && authorization !== "null")) {
          // The personID will be the id of the payload, or, if testing, the parsedInt of the authorization string
          const personID = testing ? parseInt(authorization) : (decode as jwt.JwtPayload).id;
          const person = personsDB.findOne({ $loki: personID });

          if (!person) return handleError(res, "User not found", 404);
          if (onlyAdmins && person.role !== "admin") return handleError(res, "Only for admins", 401);
          if (!person.enabled) return handleError(res, "User disabled", 401);

          const { password: _, meta: __, $loki: id, ...userData } = person;
          req.authPerson = { ...userData, id };
        }

        next();
      }
    );
  };

/**
 * It only authenticates admins, but if there are no admins, it does no authentication and permits everything.
 * It passes no person through the body.
 */
export const authIfNoAdmin = authJWT(false, true);

/**
 * Only permits accounts that are admin.
 */
export const authOnlyAdmins = authJWT(true);

/**
 * Permits every role of account.
 */
export const authAllRoles = authJWT(false);
