import CommonRequest from "../../commonRequest.type";

export default interface SignIn
  extends CommonRequest<
    any,
    {
      username: string;
      password: string;
    }
  > {}
