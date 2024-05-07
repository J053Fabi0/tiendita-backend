import CommonRequest from "../../commonRequest.type.ts";
import PersonsDB from "../../collections/personsDB.type.ts";

export default interface PostPerson extends CommonRequest<Omit<PersonsDB, "meta" | "$loki">> {}
