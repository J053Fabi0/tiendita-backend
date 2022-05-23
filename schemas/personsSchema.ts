import Joi from "joi";
import { validIDs, a } from "./schemaUtils";
import { personsDB } from "../db/collections/collections";

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

export const getSignIn = a(
  Joi.object({ password: Joi.string().required(), username: Joi.string().required().lowercase() }),
  "query"
);

export const getPersons = a(
  Joi.object({ enabled: Joi.boolean().default(true), role: role.valid("all").default("all") }),
  "query"
);

// sign up
export const postPerson = a(
  Joi.object({
    name: name.required(),
    username: username.required(),
    password: password.required(),
    role: role.default("employee"),
  })
);

export const deletePerson = a(Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required() }));

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

    id: Joi.number().custom(validIDs(personsDB)).required(),
  }).or("name", "username")
);
