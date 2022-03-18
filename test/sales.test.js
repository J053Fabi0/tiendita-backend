const app = require("../index");
const request = require("supertest");
const { whipeData } = require("./testUtils");
const { productsDB, personsDB, salesDB } = require("../db/collections/collections");

beforeEach(whipeData);

describe("POST /sale", () => {
  beforeEach(() => {
    productsDB.insertOne({ name: "a", price: 1, stock: 1, tags: [1, 2, 3], description: "a", enabled: true });
    personsDB.insertOne({ name: "a" });
  });

  it("should response with status 200 and no body", async () => {
    const response = await request(app).post("/sale").send({ person: 1, product: 1 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
  });

  it("should exist on database", async () => {
    expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
    await request(app).post("/sale").send({ person: 1, product: 1 });
    expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
  });

  describe("when specialPrice is given", () => {
    it("should not permit cash to go higher than specialPrice", async () => {
      const response = await request(app)
        .post("/sale")
        .send({ person: 1, product: 1, specialPrice: 100, cash: 101 });
      expect(response.body.error.description).toBe("");
    });

    it("should permit cash to be equal to specialPrice", async () => {
      expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
      await request(app).post("/sale").send({ person: 1, product: 1, specialPrice: 100, cash: 100 });
      expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
    });
  });

  describe("when specialPrice isn't given", () => {
    it("should not permit cash to go higher than price", async () => {
      const response = await request(app).post("/sale").send({ person: 1, product: 1, cash: 2 });
      expect(response.body.error.description).toBe("");
    });

    it("should permit cash to be equal to price", async () => {
      expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
      await request(app).post("/sale").send({ person: 1, product: 1, cash: 1 });
      expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
    });
  });
});
