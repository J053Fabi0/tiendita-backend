import CommonRequest from "../../commonRequest.type";

export default interface SignInTelegram
  extends CommonRequest<
    any,
    {
      id: number;
      hash: string;
      auth_date: string;
      username?: string;
      last_name?: string;
      photo_url?: string;
      first_name?: string;
    }
  > {}
