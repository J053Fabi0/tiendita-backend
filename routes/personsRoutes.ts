import { Router } from "express";
import * as s from "../schemas/personsSchema";
import * as c from "../controllers/personsController";

const personsRoutes = Router();

personsRoutes.get("/persons", s.getPerson, c.getPersons);

personsRoutes.post("/person", s.postPerson, c.postPerson);

personsRoutes.delete("/person", s.deletePerson, c.deletePerson);

personsRoutes.patch("/person", s.patchPerson, c.patchPerson);

export default personsRoutes;
