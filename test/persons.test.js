const app = require("../index");
const request = require("supertest");
const { whipeData } = require("./testUtils");
const { personsDB } = require("../db/collections/collections");

beforeEach(whipeData);

describe("POST person", () => {
  const getResponse = () => request(app).post("/person").send({ name: "a" });

  it("should specify json as the content type in the http header", async () => {
    const response = await getResponse();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should reply with the new $loki of the person", async () => {
    const response = await getResponse();
    expect(response.body.message.id).toBe(1);
  });

  it("should exist in database", async () => {
    await getResponse();
    expect(personsDB.findOne({ $loki: 1 })).toBeTruthy();
  });
});

describe("DELETE person", () => {
  describe("if the person exists", () => {
    beforeEach(async () => await request(app).post("/person").send({ name: "a" }));

    it("should return 204 and no body", async () => {
      const response = await request(app).delete("/person").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should set enabled to false", async () => {
      expect(personsDB.findOne({ $loki: 1 })).not.toBeNull;
      expect(personsDB.findOne({ $loki: 1 }).enabled).toBe(true);
      await request(app).delete("/person").send({ id: 1 });
      expect(personsDB.findOne({ $loki: 1 })).not.toBeNull;
      expect(personsDB.findOne({ $loki: 1 }).enabled).toBe(false);
    });
  });

  describe("if the person doesn't exist", () => {
    it("should return an error", async () => {
      const response = await request(app).delete("/person").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("PATCH person", () => {
  describe("if the person exists", () => {
    it("should return a 200 status and no body", async () => {
      await request(app).post("/person").send({ name: "a" });
      const response = await request(app).patch("/person").send({ id: 1, name: "A" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

    it("should change the values", async () => {
      const datas = [
        ["name", "A"],
        ["enabled", false],
      ];

      for (const [key, value] of datas) {
        await request(app)
          .post("/person")
          .send({ name: "a", tags: ["a"] });

        await request(app)
          .patch("/person")
          .send({ id: 1, [key]: value });

        expect(personsDB.findOne({ $loki: 1 })[key]).toEqual(value);

        whipeData();
      }
    });
  });

  describe("if person doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request(app).patch("/person").send({ id: 1, name: "a" });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("GET persons", () => {
  beforeEach(() => {
    personsDB.insert([
      { name: "a", enabled: true },
      { name: "b", enabled: false },
    ]);
  });

  it("should specify json as the content type in the http header", async () => {
    const response = await request(app).get("/persons").send();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should get all the enabled products", async () => {
    const response = await request(app).get("/persons").send();
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("a");
  });

  it("should get all the disabled products, when enabled is false", async () => {
    const response = await request(app).get("/persons").send({ enabled: false });
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("b");
  });
});
