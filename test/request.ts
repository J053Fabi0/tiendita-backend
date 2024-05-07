import app from "../index.ts";
import supertest from "supertest";

/**
 * A simple request with no "Authorization" header set at all, which lets you simulate a real call, since
 * it wont be taken as a test inside the authJWT middleware.
 */
export const requestNoAuth = supertest(app);

const hook = (method: "post" | "get" | "put" | "delete" | "patch", id?: number) => (args: any) =>
  requestNoAuth[method](args).set("Authorization", id ? id.toString() : "null");

const request = (id?: number) =>
  ({
    get: hook("get", id),
    put: hook("put", id),
    post: hook("post", id),
    patch: hook("patch", id),
    delete: hook("delete", id),
  } as const);

/**
 * Request with the auth header set as "null", to permit authentication but no authPerson is defined
 * into the body object when the next middleware is called.
 */
export default request();

/**
 * Request with the auth header set as "1", to permit authentication with the body.authPerson set to whatever
 * person with $loki === 1 there is.
 */
export const requestId1 = request(1);
/**
 * Request with the auth header set as "2", to permit authentication with the body.authPerson set to whatever
 * person with $loki === 2 there is.
 */
export const requestId2 = request(2);
/**
 * Request with the auth header set as "3", to permit authentication with the body.authPerson set to whatever
 * person with $loki === 3 there is.
 */
export const requestId3 = request(3);
/**
 * The request function that lets you set a custom ID, to permit authentication with the body.authPerson set to whatever
 * person with $loki === ID there is.
 */
export const requestIdCustom = request;
