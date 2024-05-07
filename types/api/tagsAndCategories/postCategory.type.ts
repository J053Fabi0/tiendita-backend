import CommonRequest from "../../commonRequest.type.ts";
import CategoriesDB from "../../collections/categoriesDB.type.ts";

interface PostCategoryBody extends Omit<CategoriesDB, "tags"> {
  tags: string[];
}
export default interface PostCategory extends CommonRequest<PostCategoryBody> {}
