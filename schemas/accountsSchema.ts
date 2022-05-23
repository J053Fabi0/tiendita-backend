import Joi from "joi";
import { validIDs, a } from "./schemaUtils";
import { personsDB } from "../db/collections/collections";

const name = Joi.string().min(1).max(30).trim();
const username = Joi.string()
  .lowercase()
  .regex(/^(?=.{5,32}$)(?!.*__)[a-z][a-z0-9_]*[a-z0-9]$/);

export const postSignUp = a(
  Joi.object({
    name: name.required(),
    username: username.custom((username: string, { error }) => {
      const allUsernames = personsDB.find().map((person) => person.username);
      return allUsernames.includes(username) ? error("any.invalid", { invalids: allUsernames }) : username;
    }),
  })
);
