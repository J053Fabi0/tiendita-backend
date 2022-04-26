import PersonsDB from "../../collections/personsDB.type";

export default interface PostPerson extends Omit<PersonsDB, "meta" | "$loki"> {}
