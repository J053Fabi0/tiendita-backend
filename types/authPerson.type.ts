import PersonsDB from "./collections/personsDB.type.ts";

export default interface AuthPerson extends Omit<PersonsDB, "meta" | "$loki" | "password"> {
  id: number;
}
