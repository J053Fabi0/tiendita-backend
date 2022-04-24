export default interface GetSales {
  from: number;
  enabled: boolean;
  persons: number[];
  products: number[];
  tags: number[] | -1;
  tagsBehavior: "AND" | "OR";
}
