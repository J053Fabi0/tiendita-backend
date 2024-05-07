import SalesDB from "../../collections/salesDB.type.ts";
import CommonRequest from "../../commonRequest.type.ts";

interface Body extends Omit<SalesDB, "person" | "$loki" | "meta" | "product"> {
  product: number;
}
export default interface PostSale extends CommonRequest<Body> {}
