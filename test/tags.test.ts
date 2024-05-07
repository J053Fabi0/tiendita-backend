import { requestId1, requestId2 } from "./request.ts";
import TagsDB from "../types/collections/tagsDB.type.ts";
import { addAdminAndEmployee, whipeData } from "./testUtils.ts";
import CategoriesDB from "../types/collections/categoriesDB.type.ts";
import { tagsDB, categoriesDB } from "../db/collections/collections.ts";

beforeEach(whipeData);

describe("POST tag", () => {
  beforeEach(addAdminAndEmployee);

  const requestAdmin = () => requestId1.post("/tag");
  const requestEmployee = () => requestId2.post("/tag");

  describe("if admin", () => {
    describe("if category exists", () => {
      beforeEach(() => {
        categoriesDB.insertOne({ name: "a", tags: [1] } as CategoriesDB);
        tagsDB.insertOne({ name: "a", category: 1, products: [] } as unknown as TagsDB);
      });

      it("should respond with the new $loki", async () => {
        const { body } = await requestAdmin().send({ name: "b", category: 1 });
        expect(body.message).toBe(2);
      });

      it("should be added to the category", async () => {
        const { body } = await requestAdmin().send({ name: "b", category: 1 });
        expect(categoriesDB.findOne({ $loki: 1 })!.tags).toContain(body.message);
      });

      it("should exist on DB", async () => {
        const { body } = await requestAdmin().send({ name: "b", category: 1 });
        expect(tagsDB.findOne({ $loki: body.message })).toBeTruthy();
      });
    });

    describe("if category doesn't", () => {
      it("should respond with an error", async () => {
        const { body } = await requestAdmin().send({ name: "b", category: 1 });
        expect(body.error.description).toBe("Validation error: 'category' must be one of []");
      });
    });
  });

  describe("if not admin", () => {
    it("should give an error", async () => {
      categoriesDB.insertOne({ name: "a", tags: [1] } as CategoriesDB);
      tagsDB.insertOne({ name: "a", category: 1, products: [] } as unknown as TagsDB);
      const { body } = await requestEmployee().send({ name: "b", category: 1 });
      expect(body.error).toBe("Only for admins");
    });
  });
});

describe("GET tags", () => {
  beforeEach(() => {
    addAdminAndEmployee();
    categoriesDB.insertOne({ name: "a", tags: [1] } as CategoriesDB);
    tagsDB.insertOne({ name: "a", category: 1, products: [] } as unknown as TagsDB);
  });

  it("should have tags expanded in each category", async () => {
    const { body } = await requestId1.get("/tags");
    expect(body.message[0].tags[0]).toEqual({ name: "a", id: 1 });
  });

  it("should have all categories in an array", async () => {
    const { body } = await requestId1.get("/tags");
    expect(body.message.length).toBe(1);
  });
});

// describe("DELETE /tag", () => {
//   describe("when tag exists", () => {
//     it("should return status 204 and no body", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a"] });

//       const response = await request(app).delete("/tag").send({ id: 1 });
//       expect(response.statusCode).toBe(204);
//       expect(response.body).toEqual({});
//     });

//     it("should stop existing in DB", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a"] });

//       expect(tagsDB.find().length).toBe(1);
//       await request(app).delete("/tag").send({ id: 1 });
//       expect(tagsDB.find().length).toBe(0);
//     });

//     it("should delete category if it was the last tag in it", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a"] });

//       await request(app).delete("/tag").send({ id: 1 });

//       expect(categoriesDB.find().length).toBe(0);
//     });

//     it("should remove it from the category tags if there are more than 1 tags.", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a", "b"] });

//       await request(app).delete("/tag").send({ id: 1 });

//       expect(categoriesDB.findOne({ $loki: 1 })!.tags).not.toContain(1);
//     });

//     it("should remove tags from products", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a"] });

//       productsDB.insertOne({ name: "a", price: 1, stock: 1, tags: [1] } as ProductsDB);

//       expect(productsDB.findOne({ $loki: 1 })!.tags).toContain(1);
//       await request(app).delete("/tag").send({ id: 1 });
//       expect(productsDB.findOne({ $loki: 1 })!.tags).not.toContain(1);
//     });
//   });

//   describe("when tag doesn't exist", () => {
//     it("should respond with an error", async () => {
//       const response = await request(app).delete("/tag").send({ id: 1 });
//       expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
//     });
//   });
// });

// describe("PATCH /tag", () => {
//   describe("when the tag exists", () => {
//     it("should send a 200 status and no body", async () => {
//       await request(app)
//         .post("/category")
//         .send({ name: "a", tags: ["a"] });

//       const response = await request(app).patch("/tag").send({ id: 1, name: "a" });
//       expect(response.statusCode).toBe(200);
//       expect(response.body).toEqual({});
//     });

//     it("should update the values given", async () => {
//       const datas = [["name", "A"]] as const;

//       for (const [key, value] of datas) {
//         await request(app)
//           .post("/category")
//           .send({ name: "a", tags: ["a"] });

//         await request(app)
//           .patch("/tag")
//           .send({ id: 1, [key]: value });

//         expect(tagsDB.findOne({ $loki: 1 })?.[key]).toEqual(value);

//         whipeData();
//       }
//     });
//   });

//   describe("when tag doesn't exist", () => {
//     it("should respond with an error", async () => {
//       const response = await request(app).patch("/tag").send({ id: 1, name: "a" });
//       expect(response.body.error.description).toBe("Validation error: 'id' must be one of []");
//     });
//   });
// });
