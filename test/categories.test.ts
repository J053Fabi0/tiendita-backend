import app from "..";
import request from "supertest";
import { whipeData } from "./testUtils";
import { tagsDB, categoriesDB, productsDB } from "../db/collections/collections";
import ProductsDB from "../types/collections/productsDB.type";

beforeEach(whipeData);

describe("POST /category", () => {
  const getResponse = () =>
    request(app)
      .post("/category")
      .send({ name: "a", tags: ["a"] });

  it("should specify json as the content type in the http header", async () => {
    const response = await getResponse();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should reply with the new $loki of the category", async () => {
    const response = await getResponse();
    expect(response.body.message.id).toBe(1);
  });

  it("should reply with the new $lokis of the tags it created", async () => {
    const response = await getResponse();
    expect(response.body.message.tagsIDs).toEqual([1]);
  });

  it("should exist in database", async () => {
    await getResponse();
    expect(categoriesDB.findOne({ $loki: 1 })).toBeTruthy();
  });

  it("should contain all the tags ids", async () => {
    await getResponse();
    expect(categoriesDB.findOne({ $loki: 1 })!.tags).toEqual([1]);
  });

  it("tags for the category should exist in database", async () => {
    await getResponse();
    expect(tagsDB.findOne({ $loki: 1 })).toBeTruthy();
  });
});

describe("DELETE /category", () => {
  describe("if category exists", () => {
    beforeEach(
      async () =>
        await request(app)
          .post("/category")
          .send({ name: "a", tags: ["a"] })
    );

    it("should return 204 and no body", async () => {
      const response = await request(app).delete("/category").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should remove it from DB", async () => {
      expect(categoriesDB.findOne({ $loki: 1 })).not.toBeNull;
      await request(app).delete("/category").send({ id: 1 });
      expect(categoriesDB.findOne({ $loki: 1 })).toBeNull;
    });

    it("should delete all tags whithin it", async () => {
      expect(tagsDB.findOne({ $loki: 1 })).not.toBeNull;
      const response = await request(app).delete("/category").send({ id: 1 });
      expect(tagsDB.findOne({ $loki: 1 })).toBeNull;
    });

    it("should delete all tags from products", async () => {
      productsDB.insertOne({ name: "a", price: 1, stock: 1, tags: [1] } as ProductsDB);

      expect(productsDB.findOne({ $loki: 1 })!.tags).toContain(1);
      await request(app).delete("/category").send({ id: 1 });
      expect(productsDB.findOne({ $loki: 1 })!.tags).not.toContain(1);
    });
  });

  describe("if category doesn't exist", () => {
    it("should return an error", async () => {
      const response = await request(app).delete("/category").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("PATCH /category", () => {
  describe("if category exists", () => {
    it("should return a 200 status and no body", async () => {
      await request(app)
        .post("/category")
        .send({ name: "a", tags: ["a"] });
      const response = await request(app).patch("/category").send({ id: 1, name: "A" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

    it("should change the values", async () => {
      const datas = [["name", "A"]] as const;

      for (const [key, value] of datas) {
        await request(app)
          .post("/category")
          .send({ name: "a", tags: ["a"] });

        await request(app)
          .patch("/category")
          .send({ id: 1, [key]: value });

        expect(categoriesDB.findOne({ $loki: 1 })?.[key]).toEqual(value);

        whipeData();
      }
    });
  });

  describe("if category doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request(app).patch("/category").send({ id: 1, name: "a" });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});
