export default interface TagsDB {
  meta: any;
  name: string;
  $loki: number;
  category: number; // The $loki of the category it belongs to
  products: number[]; // The $loki of the products it belongs to
}
