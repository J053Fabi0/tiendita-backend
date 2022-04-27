import CommonRequest from "../../commonRequest.type";

export default interface PatchCategory
  extends CommonRequest<{
    id: number;
    name?: string;
  }> {}
