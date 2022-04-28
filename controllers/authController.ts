import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import handleError from "../utils/handleError";
import SignIn from "../types/api/persons/signIn.type";
import { personsDB } from "../db/collections/collections";
import CommonResponse from "../types/commonResponse.type";
import PersonsDB from "../types/collections/personsDB.type";
import PostPerson from "../types/api/persons/postPerson.type";

export const signup = ({ body: { role, name, username, password } }: PostPerson, res: CommonResponse) => {
  const user = personsDB.insertOne({
    ...{ role, name, enabled: true, username, password: bcrypt.hashSync(password, 10) },
  } as PersonsDB) as PersonsDB;

  res.send({ message: user.$loki });
};

export const signin = ({ query: { password, username } }: SignIn, res: CommonResponse) => {
  const person = personsDB.findOne({ username: username });

  // Either is the user doesn't exist or if the password is not valid, the error is the same.
  if (!person || !bcrypt.compareSync(password, person.password)) return handleError(res, "Invalid data", 401);

  res.send({
    message: {
      person: {
        id: person.$loki,
        name: person.name,
        role: person.role,
        username: person.username,
      },
      authToken: jwt.sign({ id: person.$loki }, process.env.API_SECRET as string),
    },
  });
};
