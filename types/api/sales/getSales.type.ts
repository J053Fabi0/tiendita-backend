import CommonRequest from "../../commonRequest.type";

export default interface GetSales
  extends CommonRequest<
    null,
    {
      from: number;
      enabled: boolean;
      persons: number[];
      products: number[];
      tags: number[] | -1;
      tagsBehavior: "AND" | "OR";
    }
  > {}
