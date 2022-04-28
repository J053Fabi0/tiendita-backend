import PersonsDB from "../../collections/personsDB.type";
import CommonRequest from "../../commonRequest.type";

export default interface PostPerson extends CommonRequest<Omit<PersonsDB, "meta" | "$loki">> {}
