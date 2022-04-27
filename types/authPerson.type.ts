import PersonsDB from "./collections/personsDB.type";

export default interface AuthPerson extends Omit<PersonsDB, "meta" | "$loki" | "password"> {
  id: number;
}
