const app = require("../index");
const request = require("supertest");
const { tagsDB, categoriesDB } = require("../db/collections/collections");

const whipeData = () => {
  tagsDB.clear({ removeIndices: true });
  categoriesDB.clear({ removeIndices: true });
};

beforeEach(whipeData);

describe("POST /tags", () => {
  it("should specify json as the content type in the http header", async () => {
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });
    const response = await request(app).post("/tag").send({ name: "b", category: 1 });
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  describe("if category exists", () => {
    it("should respond with the new $loki", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });
      const response = await request(app).post("/tag").send({ name: "b", category: 1 });
      expect(response.body.message).toBe(2);
    });

    it("should be added to the category", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });
      const response = await request(app).post("/tag").send({ name: "b", category: 1 });
      expect(categoriesDB.findOne({ $loki: 1 }).tags).toContain(response.body.message);
    });

    it("should exist on DB", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });
      const response = await request(app).post("/tag").send({ name: "b", category: 1 });
      expect(tagsDB.findOne({ $loki: response.body.message })).toBeTruthy();
    });
  });

  describe("if category doesn't", () => {
    it("should respond with an error", async () => {
      const response = await request(app).post("/tag").send({ name: "b", category: 1 });
      expect(response.body.error.description).toBe("Validation error: 'category' must be one of []");
    });
  });
});

describe("GET /tags", () => {
  it("should specify json as the content type in the http header", async () => {
    const response = await request(app).get("/tags");
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should have tags expanded in each category", async () => {
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["b", "c"] });

    const response = await request(app).get("/tags");
    expect(response.body.message[0].tags[0]).toEqual({ name: "b", id: 1 });
  });

  it("should have all categories in an array", async () => {
    await request(app)
      .post("/category")
      .send({ name: "a", tags: ["b", "c"] });

    const response = await request(app).get("/tags");
    expect(response.body.message.length).toBe(1);
  });
});

describe("DELETE /tags", () => {
  describe("when tag exists", () => {
    it("should return status 204 and no body", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });

      const response = await request(app).delete("/tag").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should stop existing in DB", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });

      expect(tagsDB.find({}).length).toBe(1);
      await request(app).delete("/tag").send({ id: 1 });
      expect(tagsDB.find({}).length).toBe(0);
    });

    it("should delete category if it was the last tag in it", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });

      await request(app).delete("/tag").send({ id: 1 });

      expect(categoriesDB.find({}).length).toBe(0);
    });

    it("should remove it from the category tags if there are more than 1 tags.", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a", "b"] });

      await request(app).delete("/tag").send({ id: 1 });

      expect(categoriesDB.findOne({ $loki: 1 }).tags).not.toContain(1);
    });
  });
});
