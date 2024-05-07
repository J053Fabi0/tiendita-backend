import { Request } from "express";
import AuthPerson from "./authPerson.type.ts";

export default interface CommonRequest<Body = any, Query = any> extends Request<{}, any, Body, Query> {
  authPerson?: AuthPerson;
}
