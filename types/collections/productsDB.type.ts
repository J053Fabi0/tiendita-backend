export default interface ProductsDB {
  meta: any;
  name: string;
  price: number;
  stock: number;
  $loki: number;
  tags: number[]; // the $loki of the tags it has
  enabled: boolean;
  description: string;
}
