import CommonRequest from "../../commonRequest.type";

export default interface PatchPersonsTelegramID
  extends CommonRequest<{
    id: number;
    hash: string;
    auth_date: string;
    username?: string;
    last_name?: string;
    photo_url?: string;
    first_name?: string;
  }> {}
