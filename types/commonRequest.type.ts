import { Request } from "express";
import AuthPerson from "./authPerson.type";

export default interface CommonRequest<Body = any, Query = any> extends Request<{}, any, Body, Query> {
  authPerson?: AuthPerson;
}
