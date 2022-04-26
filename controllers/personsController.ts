import handleError from "../utils/handleError";
import { personsDB } from "../db/collections/collections";
import CommonResponse from "../types/commonResponse.type";
import PostPerson from "../types/api/persons/postPerson.type";
import PatchPerson from "../types/api/persons/patchPerson.type";
import PersonsDB from "../types/collections/personsDB.type";

export const getPersons = (
  { body: { enabled, role } }: { body: { enabled: boolean; role: "employee" | "admin" | "all" } },
  res: CommonResponse
) => {
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

export const postPerson = ({ body }: { body: PostPerson }, res: CommonResponse) => {
  try {
    res.send({ message: { id: personsDB.insertOne(body as PersonsDB)!.$loki } });
  } catch (e) {
    handleError(res, e);
  }
};

export const deletePerson = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    personsDB.findOne({ $loki: id })!.enabled = false;
    res.status(204).send();
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
