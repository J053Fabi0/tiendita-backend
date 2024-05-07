import CommonRequest from "../../commonRequest.type.ts";

export default interface GetSales
  extends CommonRequest<
    null,
    {
      from: number;
      until: number;
      enabled: boolean;
      persons: number[];
      products: number[];
      tags: number[] | -1;
      tagsBehavior: "AND" | "OR";
    }
  > {}
