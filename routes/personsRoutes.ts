import { Router } from "express";
import * as s from "../schemas/personsSchema";
import * as c from "../controllers/personsController";
import { signup, signin } from "../controllers/authController";
import { authIfNoAdmin, authJWTOnlyAdmins } from "../middlewares/authJWT";

const personsRoutes = Router();

personsRoutes.get("/signin", s.getSignIn, signin);
personsRoutes.get("/persons", authJWTOnlyAdmins, s.getPersons, c.getPersons);

personsRoutes.post("/person", authIfNoAdmin, s.postPerson, signup);

// personsRoutes.delete("/person", s.deletePerson, c.deletePerson);

// personsRoutes.patch("/person", s.patchPerson, c.patchPerson);

export default personsRoutes;
