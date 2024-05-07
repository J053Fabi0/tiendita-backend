import { requestId1, requestId2 } from "./request.ts";
import TagsDB from "../types/collections/tagsDB.type.ts";
import SalesDB from "../types/collections/salesDB.type.ts";
import PersonsDB from "../types/collections/personsDB.type.ts";
import { addAdminAndEmployee, whipeData } from "./testUtils.ts";
import ProductsDB from "../types/collections/productsDB.type.ts";
import { productsDB, salesDB, personsDB, tagsDB } from "../db/collections/collections.ts";

beforeEach(whipeData);

describe("POST sale", () => {
  beforeEach(() => {
    addAdminAndEmployee();
    productsDB.insertOne({
      price: 1,
      stock: 1,
      name: "a",
      enabled: true,
      tags: [1, 2, 3],
      description: "a",
    } as ProductsDB);
  });
  const thisRequest = () => requestId2.post("/sale");

  it("should response with status 200 and the id of the new sale", async () => {
    const { body, statusCode } = await thisRequest().send({ product: 1 });
    expect(statusCode).toBe(200);
    expect(body.message).toEqual({ id: 1 });
  });

  it("should exist on database", async () => {
    expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
    await thisRequest().send({ product: 1 });
    const { date, meta: _, ...sale } = salesDB.findOne({ $loki: 1 }) as SalesDB;
    expect(typeof date).toBe("number");
    expect(sale).toEqual({
      cash: 1,
      $loki: 1,
      quantity: 1,
      enabled: true,
      person: { id: 2, name: "employee" },
      product: { id: 1, name: "a", price: 1 },
    });
  });

  it("when defining a comment, should add one", async () => {
    expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
    await thisRequest().send({ product: 1, comment: "a" });
    const { date, meta: _, ...sale } = salesDB.findOne({ $loki: 1 }) as SalesDB;
    expect(typeof date).toBe("number");
    expect(sale).toEqual({
      cash: 1,
      $loki: 1,
      quantity: 1,
      comment: "a",
      enabled: true,
      person: { id: 2, name: "employee" },
      product: { id: 1, name: "a", price: 1 },
    });
  });

  it("should change the stock accordingly", async () => {
    expect(productsDB.findOne({ $loki: 1 })!.stock).toBe(1);
    await thisRequest().send({ product: 1 });
    expect(productsDB.findOne({ $loki: 1 })!.stock).toBe(0);
  });

  describe("when specialPrice is given", () => {
    it("should not permit cash to go higher than specialPrice", async () => {
      const response = await thisRequest().send({ product: 1, specialPrice: 100, cash: 101 });
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 100");
    });

    it("should not permit cash to go higher than specialPrice times quantity", async () => {
      const response = await thisRequest().send({ product: 1, specialPrice: 100, cash: 201, quantity: 2 });
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 200");
    });

    it("should permit cash to be equal to specialPrice", async () => {
      expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
      await thisRequest().send({ product: 1, specialPrice: 100, cash: 100 });
      expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
    });
  });

  describe("when specialPrice isn't given", () => {
    it("should not permit cash to go higher than price * quantity", async () => {
      const response = await thisRequest().send({ product: 1, cash: 3, quantity: 2 });
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 2");
    });

    it("should not permit cash to go higher than price", async () => {
      const response = await thisRequest().send({ product: 1, cash: 2 });
      expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 1");
    });

    it("should permit cash to be equal to price", async () => {
      expect(salesDB.findOne({ $loki: 1 })).toBeFalsy();
      await thisRequest().send({ product: 1, cash: 1 });
      expect(salesDB.findOne({ $loki: 1 })).toBeTruthy();
    });
  });
});

describe("GET sale", () => {
  beforeEach(addAdminAndEmployee);
  const thisRequest = (query: object = {}) => requestId1.get("/sale").query(query);

  describe("when the sale exists", () => {
    it("should return the sale", async () => {
      const sale = {
        date: 1,
        cash: 2,
        quantity: 1,
        enabled: true,
        specialPrice: 2,
        person: { id: 1, name: "a" },
        product: { id: 1, name: "a", price: 1 },
      };
      salesDB.insertOne({ ...sale } as SalesDB);

      const { body } = await thisRequest({ id: 1 });
      expect(body.message).toEqual({ id: 1, ...sale });
    });
  });

  describe("when the sale doesn't exist", () => {
    it("should give an error", async () => {
      const response = await thisRequest({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

describe("GET sales", () => {
  beforeEach(addAdminAndEmployee);
  const thisRequest = (query: object = {}) => requestId1.get("/sales").query(query);

  describe("when there are sales", () => {
    const sale1 = {
      id: 1,
      date: 1,
      cash: 2,
      quantity: 1,
      specialPrice: 2,
      person: { name: "a", id: 1 },
      product: { name: "a", id: 1, price: 1 },
    };
    const sale2 = {
      id: 2,
      cash: 1,
      date: 100,
      quantity: 1,
      person: { name: "b", id: 2 },
      product: { name: "b", id: 2, price: 2 },
    };
    const sale3 = {
      id: 3,
      date: 1,
      cash: 2,
      quantity: 1,
      specialPrice: 2,
      person: { name: "a", id: 1 },
      product: { name: "a", id: 1, price: 1 },
    };
    beforeEach(() => {
      productsDB.insert([
        { name: "a", tags: [], price: 1 } as unknown as ProductsDB,
        { name: "b", tags: [1], price: 2 } as ProductsDB,
      ]);
      tagsDB.insert([{ name: "a" } as TagsDB, { name: "b" } as TagsDB]);
      personsDB.insert([{ name: "a" } as PersonsDB, { name: "b" } as PersonsDB]);
      salesDB.insert([
        {
          date: 1,
          cash: 2,
          quantity: 1,
          enabled: true,
          specialPrice: 2,
          person: { name: "a", id: 1 },
          product: { name: "a", id: 1, price: 1 },
        } as SalesDB,
        {
          cash: 1,
          date: 100,
          quantity: 1,
          enabled: true,
          person: { name: "b", id: 2 },
          product: { name: "b", id: 2, price: 2 },
        } as SalesDB,
        {
          date: 1,
          cash: 2,
          quantity: 1,
          enabled: false,
          specialPrice: 2,
          person: { name: "a", id: 1 },
          product: { name: "a", id: 1, price: 1 },
        } as SalesDB,
      ]);
    });

    it("should return the array of sales available by default", async () => {
      const response = await thisRequest();
      expect(response.body.message).toEqual([sale2, sale1]);
    });

    it("should only return sales from person 1 that are enabled", async () => {
      const response = await thisRequest({ persons: [1] });
      expect(response.body.message).toEqual([sale1]);
    });

    it("should only return sales from time 100 or greater that are enabled", async () => {
      const response = await thisRequest({ from: 100 });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales from time 1 or earlier that are enabled", async () => {
      const response = await thisRequest({ until: 1 });
      expect(response.body.message).toEqual([sale1]);
    });

    it("should only return sales from product 2 that are enabled", async () => {
      const response = await thisRequest({ products: [2] });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales that have tag 1", async () => {
      const response = await thisRequest({ tags: [1] });
      expect(response.body.message).toEqual([sale2]);
    });

    it("should only return sales that have tags 1 AND 2", async () => {
      productsDB.insertOne({ tags: [1, 2] } as ProductsDB);
      salesDB.insertOne({
        cash: 1,
        date: 100,
        quantity: 1,
        enabled: true,
        person: { id: 2, name: "b" },
        product: { id: 3, name: "c", price: 3 },
      } as SalesDB);
      const response = await thisRequest({ tags: [1, 2], tagsBehavior: "AND" });
      expect(response.body.message).toEqual([
        {
          id: 4,
          cash: 1,
          date: 100,
          quantity: 1,
          person: { id: 2, name: "b" },
          product: { id: 3, name: "c", price: 3 },
        },
      ]);
    });

    it("should only return sales that have tags 1 OR 2", async () => {
      salesDB.insertOne({
        cash: 1,
        date: 99,
        quantity: 1,
        enabled: true,
        person: { id: 2, name: "b" },
        product: { name: "b", id: 2, price: 2 },
      } as SalesDB);
      const response = await thisRequest({ tags: [1, 2] });
      expect(response.body.message).toEqual([
        sale2, // the one with the greater time goes first
        {
          id: 4,
          cash: 1,
          date: 99,
          quantity: 1,
          person: { id: 2, name: "b" },
          product: { name: "b", id: 2, price: 2 },
        },
      ]);
    });

    it("should only return sales that are not enabled", async () => {
      const response = await thisRequest({ enabled: false });
      expect(response.body.message).toEqual([sale3]);
    });
  });

  describe("when there are no sales", () => {
    it("should return an empty array", async () => {
      const response = await thisRequest();
      expect(response.body.message).toEqual([]);
    });
  });
});

describe("DELETE sale", () => {
  beforeEach(addAdminAndEmployee);

  describe("when the sale exists", () => {
    beforeEach(() => salesDB.insertOne({ enabled: true } as SalesDB));

    it("should return status 204 and no body", async () => {
      const response = await requestId1.delete("/sale").send({ id: 1 });
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should set the enabled status to false", async () => {
      expect(salesDB.findOne({ $loki: 1 })!.enabled).toBe(true);
      await requestId1.delete("/sale").send({ id: 1 });
      expect(salesDB.findOne({ $loki: 1 })!.enabled).toBe(false);
    });
  });

  describe("when de sale doesn't exist", () => {
    it("should return an error", async () => {
      const response = await requestId1.delete("/sale").send({ id: 1 });
      expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
    });
  });
});

// describe("PATCH /sale", () => {
//   describe("when de sale exists", () => {
//     const beforeEachCb = () => {
//       personsDB.insertOne({ name: "a" } as PersonsDB);
//       productsDB.insertOne({
//         name: "a",
//         price: 10,
//         stock: 1,
//         tags: [1, 2, 3],
//         description: "a",
//         enabled: true,
//       } as ProductsDB);
//       salesDB.insert([
//         { person: 2, date: 1, product: 2, quantity: 1, cash: 1, specialPrice: 1, enabled: true } as SalesDB,
//         { person: 2, date: 1, product: 1, quantity: 1, cash: 1, enabled: true } as SalesDB,
//         { person: 2, date: 1, product: 1, quantity: 1, cash: 1, specialPrice: 1, enabled: true } as SalesDB,
//       ]);
//     };
//     beforeEach(beforeEachCb);

//     it("should return status 200 and no body", async () => {
//       const response = await request(app).patch("/sale").send({ id: 1, person: 1 });
//       expect(response.statusCode).toBe(200);
//       expect(response.body).toEqual({});
//     });

//     it("should change the given values, quantity, date or enabled", async () => {
//       const datas = [
//         ["date", 2],
//         ["quantity", 3],
//         ["enabled", false],
//       ] as const;

//       for (const [key, value] of datas) {
//         await request(app)
//           .patch("/sale")
//           .send({ id: 1, [key]: value });

//         expect(salesDB.findOne({ $loki: 1 })?.[key]).toEqual(value);

//         whipeData();
//         beforeEachCb();
//       }
//     });

//     describe("changing cash", () => {
//       it("should not be grater than the price of the product", async () => {
//         const response = await request(app).patch("/sale").send({ id: 2, cash: 11 });
//         expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 10");
//       });

//       it("should not be grater than the specialPrice of the product", async () => {
//         const response = await request(app).patch("/sale").send({ id: 1, cash: 2 });
//         expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 1");
//       });

//       it("should not be grater than the specialPrice of the patch", async () => {
//         const response = await request(app).patch("/sale").send({ id: 1, cash: 21, specialPrice: 20 });
//         expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 20");
//       });

//       it("should not be grater than the price of the product when specialPrice is being deleted", async () => {
//         const response = await request(app).patch("/sale").send({ id: 3, cash: 11, specialPrice: -1 });
//         expect(response.body.error.description).toBe("Validation error: 'cash' must be less than or equal to 10");
//       });
//     });

//     describe("changing person", () => {
//       it("should change it", async () => {
//         expect(salesDB.findOne({ $loki: 1 })!.person).toEqual(2);
//         await request(app).patch("/sale").send({ id: 1, person: 1 });
//         expect(salesDB.findOne({ $loki: 1 })!.person).toEqual(1);
//       });

//       it("should return an error if the value is not valid", async () => {
//         const response = await request(app).patch("/sale").send({ id: 1, person: 10 });
//         expect(response.body.error.description).toBe("Validation error: 'person' must be [1]");
//       });
//     });

//     describe("changing product", () => {
//       it("should change it", async () => {
//         expect(salesDB.findOne({ $loki: 1 })!.product).toEqual(2);
//         await request(app).patch("/sale").send({ id: 1, product: 1 });
//         expect(salesDB.findOne({ $loki: 1 })!.product).toEqual(1);
//       });

//       it("should return an error if the value is not valid", async () => {
//         const response = await request(app).patch("/sale").send({ id: 1, product: 10 });
//         expect(response.body.error.description).toBe("Validation error: 'product' must be [1]");
//       });
//     });

//     describe("changing specialPrice", () => {
//       it("should change it if not -1 nor the same price as the product", async () => {
//         expect(salesDB.findOne({ $loki: 3 })!.specialPrice).toEqual(1);
//         await request(app).patch("/sale").send({ id: 3, specialPrice: 100 });
//         expect(salesDB.findOne({ $loki: 3 })!.specialPrice).toEqual(100);
//       });

//       it("should delete the value if set to -1", async () => {
//         expect(salesDB.findOne({ $loki: 3 })!.specialPrice).toEqual(1);
//         await request(app).patch("/sale").send({ id: 3, specialPrice: -1 });
//         expect(salesDB.findOne({ $loki: 3 })).not.toHaveProperty("specialPrice");
//       });

//       it("should delete the value if set to the same price as the product", async () => {
//         expect(salesDB.findOne({ $loki: 3 })!.specialPrice).toEqual(1);
//         await request(app).patch("/sale").send({ id: 3, specialPrice: 10 });
//         expect(salesDB.findOne({ $loki: 3 })).not.toHaveProperty("specialPrice");
//       });
//     });
//   });

//   describe("when sale doesn't exist", () => {
//     it("should give an error", async () => {
//       const response = await request(app).patch("/sale").send({ id: 1, person: 10 });
//       expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
//     });
//   });
// });
