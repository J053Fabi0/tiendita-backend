import SalesDB from "../../collections/salesDB.type";
import CommonRequest from "../../commonRequest.type";

interface Body extends Omit<SalesDB, "person" | "$loki" | "meta" | "product"> {
  product: number;
}
export default interface PostSale extends CommonRequest<Body> {}
