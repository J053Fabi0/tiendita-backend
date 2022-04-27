import CommonRequest from "../../commonRequest.type";

export default interface PatchTag
  extends CommonRequest<{
    id: number;
    name?: string;
  }> {}
