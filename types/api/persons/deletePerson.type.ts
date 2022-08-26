import CommonRequest from "../../commonRequest.type";

export default interface DeletePerson extends CommonRequest<{ id: number }> {}
