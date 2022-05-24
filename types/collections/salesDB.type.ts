export default interface SalesDB {
  meta: any;
  date: number;
  cash: number; // total amount payed in cash, the rest is assumed to be with credit or debit card. It is not for individual, it's for all the money, the total.
  $loki: number;
  enabled: boolean;
  quantity: number;
  specialPrice?: number; // opcional, if it was sold with a special price for the hole sale. It is the total amount for the sale.
  person: {
    id: number;
    name: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
  };
}
