import { Request } from "express";
import AuthPerson from "./authPerson.type";

export default interface CommonRequest<Body = any> extends Request<{}, any, Body> {
  authPerson?: AuthPerson;
}
