import { Router } from "express";
import * as s from "../schemas/personsSchema";
import * as c from "../controllers/personsController";
import { signup, signin, signinTelegram } from "../controllers/authController";
import { authAllRoles, authIfNoAdmin, authOnlyAdmins } from "../middlewares/authJWT";

const personsRoutes = Router();

personsRoutes.get("/signin", s.getSignIn, signin);
personsRoutes.get("/persons", authOnlyAdmins, s.getPersons, c.getPersons);
personsRoutes.get("/signinTelegram", s.getSignInTelegram, signinTelegram);

personsRoutes.post("/person", authIfNoAdmin, s.postPerson, signup);

personsRoutes.delete("/person", authAllRoles, s.deletePerson, c.deletePerson);

personsRoutes.patch("/personsTelegramID", authAllRoles, s.patchPersonsTelegramID, c.patchPersonsTelegramID);

export default personsRoutes;
