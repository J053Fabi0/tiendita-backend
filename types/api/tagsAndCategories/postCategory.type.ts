import CommonRequest from "../../commonRequest.type";
import CategoriesDB from "../../collections/categoriesDB.type";

interface PostCategoryBody extends Omit<CategoriesDB, "tags"> {
  tags: string[];
}
export default interface PostCategory extends CommonRequest<PostCategoryBody> {}
