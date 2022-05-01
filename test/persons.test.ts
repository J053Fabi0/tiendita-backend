import { whipeData } from "./testUtils";
import { personsDB } from "../db/collections/collections";
import PersonsDB from "../types/collections/personsDB.type";
import request, { requestNoAuth, requestId1, requestId2 } from "./request";

beforeEach(whipeData);

describe("GET signin", () => {
  const thisRequest = (query: object) => request.get("/signin").query(query);
  const password = "y~8];=j6@{rJSiqZSdqOB>AUE=/W<Y.34ap$d-H'.*:=sJCm*pY\\r7*YH7";

  describe("If account exists", () => {
    beforeEach(
      async () => await request.post("/person").send({ password, username: "any_username", name: "any" })
    );

    it("should return the authentication token", async () => {
      const { body } = await thisRequest({ password, username: "any_username" }).send();
      expect(typeof body.message.authToken).toBe("string");
      expect(body.message.person).toEqual({ name: "any", username: "any_username", id: 1, role: "employee" });
    });

    it("should not care about case in username", async () => {
      const { body } = await thisRequest({ password, username: "Any_Username" }).send();
      expect(typeof body.message.authToken).toBe("string");
      expect(body.message.person).toEqual({ name: "any", username: "any_username", id: 1, role: "employee" });
    });

    it("should return error if username is invalid", async () => {
      const { body } = await thisRequest({ password, username: "not_correct" }).send();
      expect(body.error).toBe("Invalid data");
    });

    it("should return error if password is invalid", async () => {
      const { body } = await thisRequest({ password: "not_correct", username: "any_username" }).send();
      expect(body.error).toBe("Invalid data");
    });
  });

  describe("If account doesn't exist", () => {
    it("should return error", async () => {
      const { body } = await thisRequest({ password, username: "any_username" }).send();
      expect(body.error).toBe("Invalid data");
    });
  });
});

describe("GET persons", () => {
  beforeEach(() =>
    personsDB.insert([
      { role: "admin", enabled: true } as PersonsDB,
      { role: "employee", enabled: true } as PersonsDB,
    ])
  );
  const requestAdmin = (query: object) => requestId1.get("/persons").query(query);
  const requestEmployee = (query: object) => requestId2.get("/persons").query(query);

  describe("if the auth user is not an admin", () => {
    it("should give an error", async () => {
      const { body } = await requestEmployee({}).send();
      expect(body.error).toBe("Only for admins");
    });
  });

  describe("if the auth user is an admin", () => {
    describe("if the admin is disabled", () => {
      it("should give an error", async () => {
        personsDB.findOne({ $loki: 1 })!.enabled = false;
        const { body } = await requestAdmin({}).send();
        expect(body.error).toBe("User disabled");
      });
    });

    describe("if the admin is enabled", () => {
      it("should return a list of the people", async () => {
        const { body } = await requestAdmin({}).send();
        expect(body.message).toEqual([
          { id: 1, role: "admin" },
          { id: 2, role: "employee" },
        ]);
      });

      it("the filter role should work", async () => {
        {
          const { body } = await requestAdmin({ role: "admin" }).send();
          expect(body.message).toEqual([{ id: 1, role: "admin" }]);
        }
        {
          const { body } = await requestAdmin({ role: "employee" }).send();
          expect(body.message).toEqual([{ id: 2, role: "employee" }]);
        }
        {
          const { body } = await requestAdmin({ role: "all" }).send();
          expect(body.message).toEqual([
            { id: 1, role: "admin" },
            { id: 2, role: "employee" },
          ]);
        }
      });

      it("the filter enabled should work", async () => {
        personsDB.insert([
          { role: "admin", enabled: false } as PersonsDB,
          { role: "employee", enabled: false } as PersonsDB,
        ]);
        {
          const { body } = await requestAdmin({ enabled: false }).send();
          expect(body.message).toEqual([
            { id: 3, role: "admin" },
            { id: 4, role: "employee" },
          ]);
        }
        {
          const { body } = await requestAdmin({ enabled: true }).send();
          expect(body.message).toEqual([
            { id: 1, role: "admin" },
            { id: 2, role: "employee" },
          ]);
        }
      });

      it("filter enabled and role should work together", async () => {
        personsDB.insert([
          { role: "admin", enabled: false } as PersonsDB,
          { role: "employee", enabled: false } as PersonsDB,
        ]);
        {
          const { body } = await requestAdmin({ enabled: false, role: "admin" }).send();
          expect(body.message).toEqual([{ id: 3, role: "admin" }]);
        }
        {
          const { body } = await requestAdmin({ enabled: true, role: "employee" }).send();
          expect(body.message).toEqual([{ id: 2, role: "employee" }]);
        }
      });
    });
  });
});

describe("POST person", () => {
  it("should permit creating a new admin if there are none in DB", async () => {
    const response = await requestNoAuth
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "any_username", name: "any" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(1);
  });

  it("should not permit creating a new admin if there are already admins in DB and token is invalid", async () => {
    personsDB.insertOne({ role: "admin" } as PersonsDB);
    const response = await requestNoAuth
      .post("/person")
      .send({ password: "sonteraohckaoek", username: "any_username", name: "any" });
    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe("Invalid JWT token");
  });

  const thisRequest = () => request.post("/person");

  it("should not permit using a username already taken", async () => {
    personsDB.insertOne({ username: "already_taken" } as PersonsDB);
    const response = await thisRequest().send({ password: "123456789", username: "already_taken", name: "any" });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.description).toBe("Validation error: 'username' contains an invalid value");
  });

  it("should return the new id of the newly created account", async () => {
    const response = await thisRequest().send({ password: "123456789", username: "any_username", name: "any" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(1);
  });

  it("should not save the actual password, but a hash", async () => {
    await thisRequest().send({ password: "123456789", username: "any_username", name: "any" });
    expect(personsDB.findOne({ $loki: 1 })!.password).not.toBe("123456789");
  });

  it("should exist in the database", async () => {
    await thisRequest().send({ password: "123456789", username: "any_username", name: "any" });
    const person = personsDB.findOne({ $loki: 1 });
    expect(person).toHaveProperty("password");
    expect(person).toHaveProperty("name", "any");
    expect(person).toHaveProperty("enabled", true);
    expect(person).toHaveProperty("role", "employee");
    expect(person).toHaveProperty("username", "any_username");
  });
});

// describe("DELETE person", () => {
//   // should not let you delet other's account if you are not an admin
//   // should let you you delete your own account if you're not admin
//   // should let you delete other's accounts if you are an admin
// });
