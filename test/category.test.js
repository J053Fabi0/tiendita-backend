const app = require("../index");
const request = require("supertest");
const { whipeData } = require("./testUtils");
const { tagsDB, categoriesDB } = require("../db/collections/collections");

beforeEach(whipeData);

describe("POST /category", () => {
  it("should specify json as the content type in the http header", async () => {
    const response = await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should reply with the new $loki of the category", async () => {
    const response = await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(response.body.message.id).toBe(1);
  });

  it("should reply with the new $lokis of the tags it created", async () => {
    const response = await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(response.body.message.tagsIDs).toEqual([1]);
  });

  it("should exist in database", async () => {
    expect(categoriesDB.findOne({ $loki: 1 })).toBeNull();
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(categoriesDB.findOne({ $loki: 1 })).toBeTruthy();
  });

  it("should contain all the tags ids", async () => {
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(categoriesDB.findOne({ $loki: 1 }).tags).toEqual([1]);
  });

  it("tags for the category should exist in database", async () => {
    expect(tagsDB.findOne({ $loki: 1 })).toBeNull();
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    expect(tagsDB.findOne({ $loki: 1 })).toBeTruthy();
  });
});
