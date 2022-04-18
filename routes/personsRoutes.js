const router = require("express").Router();
const s = require("../schemas/personsSchema");
const c = require("../controllers/personsController");

router.get("/persons", s.getPerson, c.getPersons);

router.post("/person", s.postPerson, c.postPerson);

router.delete("/person", s.deletePerson, c.deletePerson);

router.patch("/person", s.patchPerson, c.patchPerson);

module.exports = router;
