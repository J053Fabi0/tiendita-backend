import handleError from "../utils/handleError";
import { personsDB } from "../db/collections/collections";
import CommonResponse from "../types/commonResponse.type";
import PersonsDB from "../types/collections/personsDB.type";
import PostPerson from "../types/api/persons/postPerson.type";
import GetPersons from "../types/api/persons/getPersons.type";
import PatchPerson from "../types/api/persons/patchPerson.type";
import DeletePerson from "../types/api/persons/deletePerson.type";

export const getPersons = ({ query: { enabled, role } }: GetPersons, res: CommonResponse) => {
  try {
    res.send({
      message: personsDB
        .find(role !== "all" ? { enabled, role } : { enabled })
        .map(({ meta: _, enabled: __, $loki: id, ...data }) => ({ id, ...data })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const postPerson = ({ body }: PostPerson, res: CommonResponse) => {
  try {
    res.send({ message: { id: personsDB.insertOne(body as PersonsDB)!.$loki } });
  } catch (e) {
    handleError(res, e);
  }
};

export const deletePerson = ({ body: { id }, authPerson }: DeletePerson, res: CommonResponse) => {
  try {
    if (authPerson?.id === id || authPerson?.role === "admin") {
      personsDB.findOne({ $loki: id })!.enabled = false;
      res.status(204).send();
    } else handleError(res, "Only for admins or the owner of the account", 401);
  } catch (e) {
    handleError(res, e);
  }
};

export const patchPerson = ({ body: { id, ...newData } }: { body: PatchPerson }, res: CommonResponse) => {
  try {
    const obj = personsDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) (obj as any)[newDataKey] = (newData as any)[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};
