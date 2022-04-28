import CommonRequest from "../../commonRequest.type";

export default interface GetPersons
  extends CommonRequest<{}, { enabled: boolean; role: "employee" | "admin" | "all" }> {}
