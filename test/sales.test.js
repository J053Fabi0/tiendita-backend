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

  it("should response with status 200 and the id of the new sale", async () => {
    const response = await request(app).post("/sale").send({ person: 1, product: 1 });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual({ id: 1 });
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
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 100");
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
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 1");
    });

    it("should permit cash to be equal to price", async () => {
      expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
      await request(app).post("/sale").send({ person: 1, product: 1, cash: 1 });
      expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
    });
  });
});

describe("GET /sale", () => {
  describe("when the sale exists", () => {
    it("should specify json as the content type in the http header", async () => {
      const response = await request(app).get("/sale").send({ id: 1 });
      expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
    });

    it("should return the sale", async () => {
      const sale = { person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2, enabled: true };
      salesDB.insertOne(sale);
      const response = await request(app).get("/sale").send({ id: 1 });
      expect(response.body.message).toEqual(sale);
    });
  });

  describe("when the sale doesn't exist", () => {
    it("should give an error", async () => {
      const response = await request(app).get("/sale").send({ id: 1 });
      expect(response.body.error.description).toBe("");
    });
  });
});

describe("GET /sales", () => {
  describe("when there are sales", () => {
    const sales = [
      { person: 1, date: 1, product: 1, quantity: 1, tags: [], cash: 2, specialPrice: 2, enabled: true },
      { person: 2, date: 100, product: 2, quantity: 1, tags: [1], cash: 1, enabled: true },
      { person: 1, date: 1, product: 1, quantity: 1, tags: [1], cash: 2, specialPrice: 2, enabled: false },
    ];
    const sale1 = { id: 1, person: 1, date: 1, product: 1, quantity: 1, tags: [], cash: 2, specialPrice: 2 };
    const sale2 = { id: 2, person: 2, date: 100, product: 2, quantity: 1, tags: [1], cash: 1 };
    const sale3 = { id: 3, person: 1, date: 1, product: 1, quantity: 1, tags: [1], cash: 2, specialPrice: 2 };
    beforeEach(() => salesDB.insert(sales));

    it("should specify json as the content type in the http header", async () => {
      const response = await request(app).get("/sales");
      expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
    });

    it("should return the array of sales available by default", async () => {
      const response = await request(app).get("/sales");
      expect(response.body.message).toEqual([sale1, sale2]);
    });

    it("should only return sales from person 1 that are enabled", async () => {
      const response = await request(app)
        .get("/sales")
        .send({ persons: [1] });
      expect(response.body.message).toEqual([sale1]);
    });

    it("should only return sales from time 100 or greater that are enabled", async () => {
      const response = await request(app).get("/sales").send({ from: 100 });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales from product 2 that are enabled", async () => {
      const response = await request(app)
        .get("/sales")
        .send({ products: [2] });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales that have tag 1", async () => {
      const response = await request(app)
        .get("/sales")
        .send({ tags: [1] });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales that have tags 1 AND 2", async () => {
      salesDB.insertOne({ person: 2, date: 100, product: 2, quantity: 1, tags: [1, 2], cash: 1, enabled: true });
      const response = await request(app)
        .get("/sales")
        .send({ tags: [1, 2], tagsBehavior: "AND" });
      expect(response.body.message).toEqual([
        { id: 4, person: 2, date: 100, product: 2, quantity: 1, tags: [1, 2], cash: 1 },
      ]);
    });

    it("should only return sales that have tags 1 OR 2", async () => {
      salesDB.insertOne({ person: 2, date: 100, product: 2, quantity: 1, tags: [2], cash: 1, enabled: true });
      const response = await request(app)
        .get("/sales")
        .send({ tags: [1, 2] });
      expect(response.body.message).toEqual([
        sale2,
        { id: 4, person: 2, date: 100, product: 2, quantity: 1, tags: [2], cash: 1 },
      ]);
    });

    it("should only return sales that are not enabled", async () => {
      const response = await request(app).get("/sales").send({ enabled: false });
      expect(response.body.message).toEqual([sale3]);
    });
  });

  describe("when there are no sales", () => {
    it("should return an empty array", async () => {
      const response = await request(app).get("/sales");
      expect(response.body.message).toEqual([]);
    });
  });
});

describe("DELETE /sale", () => {
  describe("when the sale exists", () => {
    beforeEach(() => salesDB.insertOne({ enabled: false }));

    it("should return status 204 and no body", async () => {
      const response = await request(app).delete("/sale").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should set the enabled status to false", async () => {
      expect(salesDB.findOne({ id: 1 }).enabled).toBe(true);
      await request(app).delete("/sale").send({ id: 1 });
      expect(salesDB.findOne({ id: 1 }).enabled).toBe(false);
    });
  });

  describe("when de sale doesn't exist", () => {
    it("should return an error", async () => {
      await request(app).delete("/sale").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("PATCH /sale", () => {
  describe("when de product exists", () => {
    const beforeEachCb = () => {
      personsDB.insertOne({ name: "a" });
      productsDB.insertOne({ name: "a", price: 10, stock: 1, tags: [1, 2, 3], description: "a", enabled: true });
      salesDB.insertOne({
        ...{ person: 2, date: 1, product: 2, quantity: 1, cash: 1, specialPrice: 1, enabled: true },
      });
    };
    beforeEach(beforeEachCb);

    it("should return status 200 and no body", async () => {
      const response = await request(app).delete("/sale").send({ id: 1, person: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should change the given values, quantity, cash, date or enabled", async () => {
      const datas = [
        ["cash", 2],
        ["date", 2],
        ["quantity", 2],
        ["enabled", false],
      ];

      for (const [key, value] of datas) {
        await request(app)
          .patch("/sale")
          .send({ id: 1, [key]: value });

        expect(productsDB.findOne({ $loki: 1 })[key]).toEqual(value);

        whipeData();
        beforeEachCb();
      }
    });

    describe("changing person", () => {
      it("should change it", async () => {
        expect(productsDB.findOne({ $loki: 1 }).person).toEqual(2);
        await request(app).patch("/sale").send({ id: 1, person: 1 });
        expect(productsDB.findOne({ $loki: 1 }).person).toEqual(1);
      });

      it("should return an error if the value is not valid", async () => {
        await request(app).patch("/sale").send({ id: 1, person: 10 });
        expect(response.body.error.description).toBe("");
      });
    });

    describe("changing product", () => {
      it("should change it", async () => {
        expect(productsDB.findOne({ $loki: 1 }).product).toEqual(2);
        await request(app).patch("/sale").send({ id: 1, product: 1 });
        expect(productsDB.findOne({ $loki: 1 }).product).toEqual(1);
      });

      it("should return an error if the value is not valid", async () => {
        await request(app).patch("/sale").send({ id: 1, product: 10 });
        expect(response.body.error.description).toBe("");
      });
    });

    describe("changing specialPrice", () => {
      it("should change it if not -1 nor the same price as the product", async () => {
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).toEqual(1);
        await request(app).patch("/sale").send({ id: 1, specialPrice: 100 });
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).toEqual(100);
      });

      it("should delete the value if set to -1", async () => {
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).toEqual(1);
        await request(app).patch("/sale").send({ id: 1, specialPrice: -1 });
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).not.toHaveProperty("specialPrice");
      });

      it("should delete the value if set to the same price as the product", async () => {
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).toEqual(1);
        await request(app).patch("/sale").send({ id: 1, specialPrice: 10 });
        expect(productsDB.findOne({ $loki: 1 }).specialPrice).not.toHaveProperty("specialPrice");
      });
    });
  });
});
