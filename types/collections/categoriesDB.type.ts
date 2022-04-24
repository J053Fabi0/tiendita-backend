export default interface CategoriesDB {
  meda: any;
  name: string;
  $loki: number;
  tags: number[]; // The $loki of the products it belongs to
}
