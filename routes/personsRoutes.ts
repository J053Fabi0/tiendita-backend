import { Router } from "express";
import * as s from "../schemas/personsSchema.ts";
import * as c from "../controllers/personsController.ts";
import { signup, signin, signinTelegram } from "../controllers/authController.ts";
import { authAllRoles, authIfNoAdmin, authOnlyAdmins } from "../middlewares/authJWT.ts";

const personsRoutes = Router();

personsRoutes.get("/signin", s.getSignIn, signin);
personsRoutes.get("/persons", authOnlyAdmins, s.getPersons, c.getPersons);
personsRoutes.get("/signinTelegram", s.getSignInTelegram, signinTelegram);

personsRoutes.post("/person", authIfNoAdmin, s.postPerson, signup);

personsRoutes.delete("/person", authAllRoles, s.deletePerson, c.deletePerson);

personsRoutes.patch("/personsTelegramID", authAllRoles, s.patchPersonsTelegramID, c.patchPersonsTelegramID);

export default personsRoutes;
