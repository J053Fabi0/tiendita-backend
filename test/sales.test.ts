import { requestId1, requestId2 } from "./request";
import TagsDB from "../types/collections/tagsDB.type";
import SalesDB from "../types/collections/salesDB.type";
import PersonsDB from "../types/collections/personsDB.type";
import { addAdminAndEmployee, whipeData } from "./testUtils";
import ProductsDB from "../types/collections/productsDB.type";
import { productsDB, salesDB, personsDB, tagsDB } from "../db/collections/collections";

beforeEach(whipeData);

describe("POST sale", () => {
  beforeEach(() => {
    addAdminAndEmployee();
    productsDB.insertOne({
      name: "a",
      price: 1,
      stock: 1,
      tags: [1, 2, 3],
      description: "a",
      enabled: true,
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
    expect(sale).toEqual({ person: 2, product: 1, enabled: true, quantity: 1, cash: 1, $loki: 1 });
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

// describe("GET /sale", () => {
//   describe("when the sale exists", () => {
//     it("should specify json as the content type in the http header", async () => {
//       const response = await request(app).get("/sale").send({ id: 1 });
//       expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
//     });

//     it("should return the sale", async () => {
//       const sale = { person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2, enabled: true };
//       salesDB.insertOne({ ...sale } as SalesDB);
//       const response = await request(app).get("/sale").send({ id: 1 });
//       expect(response.body.message).toEqual({ ...sale, id: 1 });
//     });
//   });

//   describe("when the sale doesn't exist", () => {
//     it("should give an error", async () => {
//       const response = await request(app).get("/sale").send({ id: 1 });
//       expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
//     });
//   });
// });

describe("GET sales", () => {
  beforeEach(() => addAdminAndEmployee());
  const thisRequest = (query: object = {}) => requestId1.get("/sales").query(query);

  describe("when there are sales", () => {
    const sale1 = { id: 1, person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2 };
    const sale2 = { id: 2, person: 2, date: 100, product: 2, quantity: 1, cash: 1 };
    const sale3 = { id: 3, person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2 };
    beforeEach(() => {
      productsDB.insert([
        { name: "a", tags: [] } as unknown as ProductsDB,
        { name: "b", tags: [1] } as ProductsDB,
      ]);
      personsDB.insert([{ name: "a" } as PersonsDB, { name: "b" } as PersonsDB]);
      tagsDB.insert([{ name: "a" } as TagsDB, { name: "b" } as TagsDB]);
      salesDB.insert([
        { person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2, enabled: true } as SalesDB,
        { person: 2, date: 100, product: 2, quantity: 1, cash: 1, enabled: true } as SalesDB,
        { person: 1, date: 1, product: 1, quantity: 1, cash: 2, specialPrice: 2, enabled: false } as SalesDB,
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
      salesDB.insertOne({ person: 2, date: 100, product: 3, quantity: 1, cash: 1, enabled: true } as SalesDB);
      const response = await thisRequest({ tags: [1, 2], tagsBehavior: "AND" });
      expect(response.body.message).toEqual([{ id: 4, person: 2, date: 100, product: 3, quantity: 1, cash: 1 }]);
    });

    it("should only return sales that have tags 1 OR 2", async () => {
      salesDB.insertOne({ person: 2, date: 100, product: 2, quantity: 1, cash: 1, enabled: true } as SalesDB);
      const response = await thisRequest({ tags: [1, 2] });
      expect(response.body.message).toEqual([
        sale2,
        { id: 4, person: 2, date: 100, product: 2, quantity: 1, cash: 1 },
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

// describe("DELETE /sale", () => {
//   describe("when the sale exists", () => {
//     beforeEach(() => salesDB.insertOne({ enabled: true } as SalesDB));

//     it("should return status 204 and no body", async () => {
//       const response = await request(app).delete("/sale").send({ id: 1 });
//       expect(response.statusCode).toBe(204);
//       expect(response.body).toEqual({});
//     });

//     it("should set the enabled status to false", async () => {
//       expect(salesDB.findOne({ $loki: 1 })!.enabled).toBe(true);
//       await request(app).delete("/sale").send({ id: 1 });
//       expect(salesDB.findOne({ $loki: 1 })!.enabled).toBe(false);
//     });
//   });

//   describe("when de sale doesn't exist", () => {
//     it("should return an error", async () => {
//       const response = await request(app).delete("/sale").send({ id: 1 });
//       expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
//     });
//   });
// });

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
