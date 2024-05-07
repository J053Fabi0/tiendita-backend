import CommonRequest from "../../commonRequest.type.ts";
import ProductsDB from "../../collections/productsDB.type.ts";

export default interface PostProduct extends CommonRequest<ProductsDB> {}
