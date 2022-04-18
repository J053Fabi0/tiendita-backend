const handleError = require("../utils/handleError");
const { personsDB } = require("../db/collections/collections");

const a = {};

a.getPersons = ({ body: { enabled } }, res) => {
  try {
    res.send({
      message: personsDB.find({ enabled }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

a.postPerson = ({ body }, res) => {
  try {
    res.send({ message: { id: personsDB.insertOne(body).$loki } });
  } catch (e) {
    handleError(res, e);
  }
};

a.deletePerson = ({ body: { id } }, res) => {
  try {
    personsDB.findOne({ $loki: id }).enabled = false;
    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

a.patchPerson = ({ body: { id, ...newData } }, res) => {
  try {
    const obj = personsDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) obj[newDataKey] = newData[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
