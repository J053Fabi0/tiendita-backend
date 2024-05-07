import CommonRequest from "../../commonRequest.type.ts";

export default interface SignIn
  extends CommonRequest<
    any,
    {
      username: string;
      password: string;
    }
  > {}
