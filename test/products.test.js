const app = require("../index");
const request = require("supertest");
const { whipeData } = require("./testUtils");
const { tagsDB, productsDB } = require("../db/collections/collections");

beforeEach(whipeData);

describe("POST /product", () => {
  it("should specify json as the content type in the http header", async () => {
    const response = await request(app).post("/product").send({ name: "b", price: 1, stock: 1 });
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should respond with the $loki of the new product", async () => {
    const response = await request(app).post("/product").send({ name: "b", price: 1, stock: 1 });
    expect(response.body.message).toBe(1);
  });

  it("should exists in DB", async () => {
    expect(productsDB.findOne({ $loki: 1 })).toBeNull();
    await request(app).post("/product").send({ name: "b", price: 1, stock: 1 });
    expect(productsDB.findOne({ $loki: 1 })).toBeTruthy();
  });

  it("only possible tags are allowed", async () => {
    tagsDB.insertOne({ name: "a" });
    tagsDB.insertOne({ name: "b" });
    const response = await request(app)
      .post("/product")
      .send({ name: "b", price: 1, stock: 1, tags: [3] });
    expect(response.body.error.description).toBe("Validation error: 'tags[0]' must be one of [1, 2]");
  });
});

describe("GET /product", () => {
  describe("when the product exists", () => {
    beforeEach(async () => await request(app).post("/product").send({ name: "a", price: 1, stock: 1 }));

    it("should specify json as the content type in the http header", async () => {
      const response = await request(app).get("/product").send({ id: 1 });
      expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
    });

    it("it should give the product", async () => {
      const { message } = (await request(app).get("/product").send({ id: 1 })).body;
      expect(message.name).toBe("a");
      expect(message.price).toBe(1);
    });
  });

  describe("when the product doesn't exist", () => {
    it("it should give an error", async () => {
      const { error } = (await request(app).get("/product").send({ id: 1 })).body;
      expect(error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("GET /products", () => {
  beforeEach(() => {
    productsDB.insert([
      { name: "a", enabled: true },
      { name: "b", enabled: false },
    ]);
  });

  it("should specify json as the content type in the http header", async () => {
    const response = await request(app).get("/products").send();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should get all the enabled products", async () => {
    const response = await request(app).get("/products").send();
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("a");
  });

  it("should get all the disabled products, when enabled is false", async () => {
    const response = await request(app).get("/products").send({ enabled: false });
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("b");
  });
});

describe("DELETE /product", () => {
  describe("when the product exists", () => {
    beforeEach(() => productsDB.insertOne({ name: "a", enabled: true }));

    it("should return status 204 and no body", async () => {
      const response = await request(app).delete("/product").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should change its enabled value to false", async () => {
      expect(productsDB.findOne({ $loki: 1 }).enabled).toBe(true);
      await request(app).delete("/product").send({ id: 1 });
      expect(productsDB.findOne({ $loki: 1 }).enabled).toBe(false);
      await request(app).delete("/product").send({ id: 1 });
      expect(productsDB.findOne({ $loki: 1 }).enabled).toBe(false);
    });
  });

  describe("when the product doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request(app).delete("/product").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("PATCH /product", () => {
  describe("when de product exists", () => {
    const beforeEachCb = () => {
      productsDB.insertOne({ name: "a", price: 1, stock: 1, tags: [1, 2, 3], description: "a", enabled: true });
      tagsDB.insert([{ name: "a" }, { name: "b" }, { name: "c" }, { name: "d" }]);
    };
    beforeEach(beforeEachCb);

    it("should return status 200 and no body", async () => {
      const response = await request(app).delete("/product").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should change the given values", async () => {
      const datas = [
        ["name", "b"],
        ["price", 2],
        ["stock", 2],
        ["description", "b"],
        ["enabled", false],
      ];

      for (const [key, value] of datas) {
        await request(app)
          .patch("/product")
          .send({ id: 1, [key]: value });

        expect(productsDB.findOne({ $loki: 1 })[key]).toEqual(value);

        whipeData();
        beforeEachCb();
      }
    });

    it("should deleteTags", async () => {
      await request(app)
        .patch("/product")
        .send({ id: 1, deleteTags: [2] });

      expect(productsDB.findOne({ $loki: 1 }).tags).toEqual([1, 3]);
    });

    it("should give error if deleteTags aren't valid", async () => {
      const response = await request(app)
        .patch("/product")
        .send({ id: 1, deleteTags: [4] });
      expect(response.body.error.description).toBe("Validation error: 'deleteTags[0]' must be one of [1, 2, 3]");
    });

    it("should addTags", async () => {
      await request(app)
        .patch("/product")
        .send({ id: 1, addTags: [4] });

      expect(productsDB.findOne({ $loki: 1 }).tags).toEqual([1, 2, 3, 4]);
    });

    it("should give error if addTags don't exist", async () => {
      const response = await request(app)
        .patch("/product")
        .send({ id: 1, addTags: [5] });
      expect(response.body.error.description).toBe("Validation error: 'addTags[0]' must be one of [1, 2, 3, 4]");
    });

    it("should give error if addTags are already present in product", async () => {
      const response = await request(app)
        .patch("/product")
        .send({ id: 1, addTags: [1] });
      expect(response.body.error.description).toBe("Validation error: 'addTags[0]' contains an invalid value");
    });
  });

  describe("when the product doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request(app).patch("/product").send({ id: 1, name: "b" });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});
