import handleError from "../utils/handleError.ts";
import { TelegramLogin } from "node-telegram-login";
import { personsDB } from "../db/collections/collections.ts";
import CommonResponse from "../types/commonResponse.type.ts";
import PersonsDB from "../types/collections/personsDB.type.ts";
import PostPerson from "../types/api/persons/postPerson.type.ts";
import GetPersons from "../types/api/persons/getPersons.type.ts";
import PatchPerson from "../types/api/persons/patchPerson.type.ts";
import DeletePerson from "../types/api/persons/deletePerson.type.ts";
import PatchPersonsTelegramID from "../types/api/persons/patchPersonsTelegramID.type.ts";

const TelegramAuth = new TelegramLogin(Deno.env.get("BOT_TOKEN") ?? "");

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

export const patchPersonsTelegramID = (
  { body: authData, authPerson }: PatchPersonsTelegramID,
  res: CommonResponse
) => {
  try {
    if (!TelegramAuth.checkLoginData(authData)) return handleError(res, "Invalid auth data.");

    personsDB.findOne({ $loki: authPerson?.id })!.telegramID = authData.id;
    res.send();
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
