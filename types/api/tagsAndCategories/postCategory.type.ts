import CategoriesDB from "../../collections/categoriesDB.type";

export default interface PostCategory extends Omit<CategoriesDB, "tags"> {
  tags: string[];
}
