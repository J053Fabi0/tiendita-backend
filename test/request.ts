import app from "..";
import supertest from "supertest";

const hook = (method: "post" | "get" | "put" | "delete" | "patch") => (args: any) =>
  supertest(app)[method](args).set("Authorization", "testing");

const request = {
  get: hook("get"),
  put: hook("put"),
  post: hook("post"),
  patch: hook("patch"),
  delete: hook("delete"),
} as const;

export default request;
export const requestNoHeader = supertest(app);
