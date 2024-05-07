import CommonRequest from "../../commonRequest.type.ts";

export default interface PatchTag
  extends CommonRequest<{
    id: number;
    name?: string;
  }> {}
