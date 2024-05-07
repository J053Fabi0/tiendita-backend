import CommonRequest from "../../commonRequest.type.ts";

export default interface GetPersons
  extends CommonRequest<{}, { enabled: boolean; role: "employee" | "admin" | "all" }> {}
