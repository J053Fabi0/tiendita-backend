import CommonRequest from "../../commonRequest.type.ts";

export default interface PatchCategory
  extends CommonRequest<{
    id: number;
    name?: string;
  }> {}
