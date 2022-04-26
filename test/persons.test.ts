import app from "..";
import { whipeData } from "./testUtils";
import request, { requestNoHeader } from "./request";
import { personsDB } from "../db/collections/collections";
import PersonsDB from "../types/collections/personsDB.type";

beforeEach(whipeData);

describe("POST person", () => {
  it("should permit creating a new admin if there are none in DB", async () => {
    const response = await requestNoHeader
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "any_username", name: "any" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(1);
  });

  it("should not permit creating a new admin if there are already admins in DB and token is invalid", async () => {
    personsDB.insertOne({ role: "admin" } as PersonsDB);
    const response = await requestNoHeader
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "any_username", name: "any" });
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe("Invalid JWT token");
  });

  it("should not permit using a username already taken", async () => {
    personsDB.insertOne({ username: "already_taken" } as PersonsDB);
    const response = await request
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "already_taken", name: "any" });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.description).toBe("Validation error: 'username' contains an invalid value");
  });

  it("should return the new id of the newly created account", async () => {
    const response = await request
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "already_taken", name: "any" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(1);
  });

  it("should not save the actual password, but a hash", async () => {
    await request.post("/person").send({ password: "sonteraohckaoek", username: "already_taken", name: "any" });
    expect(personsDB.findOne({ $loki: 1 })!.password).not.toBe("sonteraohckaoek");
  });

  it("should exist in the database", async () => {
    await request.post("/person").send({ password: "123456789", username: "already_taken", name: "any" });
    const person = personsDB.findOne({ $loki: 1 });
    expect(person).toHaveProperty("password");
    expect(person).toHaveProperty("name", "any");
    expect(person).toHaveProperty("enabled", true);
    expect(person).toHaveProperty("role", "employee");
    expect(person).toHaveProperty("username", "already_taken");
  });
});

describe("DELETE person", () => {
  describe("if the person exists", () => {
    beforeEach(async () => await request.post("/person").send({ name: "a" }));

    it("should return 204 and no body", async () => {
      const response = await request.delete("/person").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should set enabled to false", async () => {
      expect(personsDB.findOne({ $loki: 1 })).not.toBeNull;
      expect(personsDB.findOne({ $loki: 1 })!.enabled).toBe(true);
      await request.delete("/person").send({ id: 1 });
      expect(personsDB.findOne({ $loki: 1 })).not.toBeNull;
      expect(personsDB.findOne({ $loki: 1 })!.enabled).toBe(false);
    });
  });

  describe("if the person doesn't exist", () => {
    it("should return an error", async () => {
      const response = await request.delete("/person").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("PATCH person", () => {
  describe("if the person exists", () => {
    it("should return a 200 status and no body", async () => {
      await request.post("/person").send({ name: "a" });
      const response = await request.patch("/person").send({ id: 1, name: "A" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

    it("should change the values", async () => {
      const datas = [
        ["name", "A"],
        ["enabled", false],
      ] as const;

      for (const [key, value] of datas) {
        await request.post("/person").send({ name: "a", tags: ["a"] });

        await request.patch("/person").send({ id: 1, [key]: value });

        expect(personsDB.findOne({ $loki: 1 })?.[key]).toEqual(value);

        whipeData();
      }
    });
  });

  describe("if person doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request.patch("/person").send({ id: 1, name: "a" });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("GET persons", () => {
  beforeEach(() => {
    personsDB.insert([
      { name: "a", enabled: true } as PersonsDB,
      { name: "b", enabled: false } as PersonsDB, //
    ]);
  });

  it("should specify json as the content type in the http header", async () => {
    const response = await request.get("/persons").send();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should get all the enabled products", async () => {
    const response = await request.get("/persons").send();
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("a");
  });

  it("should get all the disabled products, when enabled is false", async () => {
    const response = await request.get("/persons").send({ enabled: false });
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("b");
  });
});
