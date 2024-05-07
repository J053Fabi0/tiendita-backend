import CommonRequest from "../../commonRequest.type.ts";

export default interface DeletePerson extends CommonRequest<{ id: number }> {}
