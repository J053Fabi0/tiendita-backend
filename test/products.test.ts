import { requestId1, requestId2 } from "./request";
import TagsDB from "../types/collections/tagsDB.type";
import { addAdminAndEmployee, whipeData } from "./testUtils";
import ProductsDB from "../types/collections/productsDB.type";
import { tagsDB, productsDB } from "../db/collections/collections";

beforeEach(whipeData);

describe("POST product", () => {
  beforeEach(addAdminAndEmployee);

  describe("if admin", () => {
    const requestAdmin = () => requestId1.post("/product");

    it("should specify json as the content type in the http header", async () => {
      const response = await requestAdmin().send({ name: "b", price: 1, stock: 1 });
      expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
    });

    it("should respond with the $loki of the new product", async () => {
      const response = await requestAdmin().send({ name: "b", price: 1, stock: 1 });
      expect(response.body.message).toBe(1);
    });

    it("should exists in DB", async () => {
      expect(productsDB.findOne({ $loki: 1 })).toBeNull();
      await requestAdmin().send({ name: "b", price: 1, stock: 1 });
      expect(productsDB.findOne({ $loki: 1 })).toBeTruthy();
    });

    it("only possible tags are allowed", async () => {
      tagsDB.insertOne({ name: "a" } as TagsDB);
      tagsDB.insertOne({ name: "b" } as TagsDB);
      const response = await requestAdmin().send({ name: "b", price: 1, stock: 1, tags: [3] });
      expect(response.body.error.description).toBe("Validation error: 'tags[0]' must be one of [1, 2]");
    });
  });

  describe("if not admin", () => {
    it("should give an error", async () => {
      const { body } = await requestId2.post("/product").send({ name: "b", price: 1, stock: 1 });
      expect(body.error).toBe("Only for admins");
    });
  });
});

describe("GET product", () => {
  beforeEach(addAdminAndEmployee);

  describe("when the product exists", () => {
    beforeEach(async () => await requestId1.post("/product").send({ name: "a", price: 1, stock: 1 }));

    it("it should return 200 as the status", async () => {
      const { statusCode } = await requestId2.get("/product").query({ id: 1 }).send();
      expect(statusCode).toBe(200);
    });

    it("it should return the product", async () => {
      const { message } = (await requestId2.get("/product").query({ id: 1 }).send()).body;
      expect(message).toEqual({ id: 1, name: "a", price: 1, stock: 1, enabled: true, description: "", tags: [] });
    });
  });

  describe("when the product doesn't exist", () => {
    it("it should return an error", async () => {
      const { error } = (await requestId1.get("/product").query({ id: 1 }).send()).body;
      expect(error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("GET products", () => {
  beforeEach(() => {
    addAdminAndEmployee();
    productsDB.insert([
      { name: "a", enabled: true } as ProductsDB,
      { name: "b", enabled: false } as ProductsDB, //
    ]);
  });

  const thisRequest = (query: object = {}) => requestId2.get("/products").query(query);

  it("should specify json as the content type in the http header", async () => {
    const response = await thisRequest().send();
    expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
  });

  it("should get all the enabled products", async () => {
    const response = await thisRequest().send();
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("a");
  });

  it("should get all the disabled products, when enabled is false", async () => {
    const response = await thisRequest({ enabled: false }).send();
    expect(response.body.message.length).toBe(1);
    expect(response.body.message[0].name).toBe("b");
  });
});

describe("DELETE product", () => {
  beforeEach(addAdminAndEmployee);

  describe("when admin", () => {
    describe("when the product exists", () => {
      beforeEach(() => productsDB.insertOne({ name: "a", enabled: true } as ProductsDB));

      it("should return status 204 and no body", async () => {
        const { statusCode, body } = await requestId1.delete("/product").send({ id: 1 });
        expect(statusCode).toBe(204);
        expect(body).toEqual({});
      });

      it("should change its enabled value to false", async () => {
        expect(productsDB.findOne({ $loki: 1 })!.enabled).toBe(true);
        await requestId1.delete("/product").send({ id: 1 });
        expect(productsDB.findOne({ $loki: 1 })!.enabled).toBe(false);
        await requestId1.delete("/product").send({ id: 1 });
        expect(productsDB.findOne({ $loki: 1 })!.enabled).toBe(false);
      });
    });

    describe("when the product doesn't exist", () => {
      it("should give an error", async () => {
        const { body } = await requestId1.delete("/product").send({ id: 1 });
        expect(body.error.description).toBe("Validation error: 'id' must be one of []");
      });
    });
  });

  describe("when not admin", () => {
    it("should return an error", async () => {
      const { body } = await requestId2.delete("/product").send({ id: 1 });
      expect(body.error).toBe("Only for admins");
    });
  });
});

describe("PATCH product", () => {
  beforeEach(addAdminAndEmployee);
  describe("when admin", () => {
    const request = () => requestId1.patch("/product");

    describe("when de product exists", () => {
      const beforeEachCb = () => {
        productsDB.insertOne({
          name: "a",
          price: 1,
          stock: 1,
          tags: [1, 2, 3],
          description: "a",
          enabled: true,
        } as ProductsDB);
        tagsDB.insert([
          { name: "a" } as TagsDB,
          { name: "b" } as TagsDB,
          { name: "c" } as TagsDB,
          { name: "d" } as TagsDB,
        ]);
      };
      beforeEach(beforeEachCb);

      it("should return status 200 and no body", async () => {
        const response = await request().send({ id: 1, price: 2 });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({});
      });

      it("should change the given values", async () => {
        const datas = [
          ["price", 2],
          ["stock", 2],
          ["name", "b"],
          ["enabled", false],
          ["description", "b"],
        ] as const;

        for (const [key, value] of datas) {
          const { statusCode } = await request().send({ id: 1, [key]: value });

          expect(statusCode).toBe(200);
          expect(productsDB.findOne({ $loki: 1 })?.[key]).toEqual(value);

          whipeData();
          beforeEachCb();
          addAdminAndEmployee();
        }
      });

      it("should deleteTags", async () => {
        await request().send({ id: 1, deleteTags: [2] });

        expect(productsDB.findOne({ $loki: 1 })!.tags).toEqual([1, 3]);
      });

      it("should give error if deleteTags aren't valid", async () => {
        const response = await request().send({ id: 1, deleteTags: [4] });
        expect(response.body.error.description).toBe("Validation error: 'deleteTags[0]' must be one of [1, 2, 3]");
      });

      it("should addTags", async () => {
        await request().send({ id: 1, addTags: [4] });

        expect(productsDB.findOne({ $loki: 1 })!.tags).toEqual([1, 2, 3, 4]);
      });

      it("should give error if addTags don't exist", async () => {
        const response = await request().send({ id: 1, addTags: [5] });
        expect(response.body.error.description).toBe("Validation error: 'addTags[0]' must be one of [1, 2, 3, 4]");
      });

      it("should give error if addTags are already present in product", async () => {
        const response = await request().send({ id: 1, addTags: [1] });
        expect(response.body.error.description).toBe("Validation error: 'addTags[0]' contains an invalid value");
      });
    });

    describe("when the product doesn't exist", () => {
      it("should give an error", async () => {
        const response = await request().send({ id: 1, name: "b" });
        expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
      });
    });
  });

  describe("when not admin", () => {
    it("should return an error", async () => {
      const { body } = await requestId2.patch("/product").send({ id: 1, price: 1 });
      expect(body.error).toBe("Only for admins");
    });
  });
});
