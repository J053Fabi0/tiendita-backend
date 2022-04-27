import SalesDB from "../../collections/salesDB.type";
import CommonRequest from "../../commonRequest.type";

export default interface PostSale extends CommonRequest<Omit<SalesDB, "person" | "$loki" | "meta">> {}
