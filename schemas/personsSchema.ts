import Joi from "joi";
import { validIDs, a } from "./schemaUtils.ts";
import { personsDB } from "../db/collections/collections.ts";

const telegramID = Joi.number();
const password = Joi.string().min(8);
const name = Joi.string().min(1).max(30).trim();
const role = Joi.string().valid("admin", "employee");
const username = Joi.string()
  .lowercase()
  .min(5)
  .max(32)
  .regex(/^(?!.*__)[a-z][a-z0-9_]*[a-z0-9]$/)
  .custom((username: string, { error }) => {
    const allUsernames = personsDB.find().map((person) => person.username);
    return allUsernames.includes(username) ? error("any.invalid") : username;
  });

const telegramAuthData = Joi.object({
  username: Joi.string(),
  last_name: Joi.string(),
  photo_url: Joi.string(),
  first_name: Joi.string(),
  id: Joi.number().required(),
  hash: Joi.string().required(),
  auth_date: Joi.number().required(),
});

export const getSignIn = a(
  Joi.object({ password: Joi.string().required(), username: Joi.string().required().lowercase() }),
  "query"
);

export const getSignInTelegram = a(telegramAuthData, "query");

export const getPersons = a(
  Joi.object({ enabled: Joi.boolean().default(true), role: role.valid("all").default("all") }),
  "query"
);

// sign up
export const postPerson = a(
  Joi.object({
    telegramID,
    name: name.required(),
    username: username.required(),
    password: password.required(),
    role: role.default("employee"),
  })
);

export const deletePerson = a(Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required() }));

export const patchPersonsTelegramID = a(telegramAuthData);

export const patchPersonsEnabled = a(
  Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required(), enabled: Joi.boolean().required() })
);

export const patchPersonsRole = a(
  Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required(), role: role.required() })
);

export const patchPerson = a(
  Joi.object({
    name,
    username,
    telegramID,

    id: Joi.number().custom(validIDs(personsDB)).required(),
  }).or("name", "username", "telegramID")
);
