export default interface SalesDB {
  meta: any;
  date: number;
  cash: number; // total amount payed in cash, the rest is assumed to be with credit or debit card. It is not for individual
  $loki: number;
  person: number; // $loki value of the person who sold it
  product: number; // $loki value of the product
  enabled: boolean;
  quantity: number;
  specialPrice?: number; // opcional, if it was sold with a special price for the hole sale. It is the total amount for the sale.
}
