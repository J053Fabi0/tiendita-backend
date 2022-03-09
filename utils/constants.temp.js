const { freeze } = Object;

module.exports = freeze({
  acceptedCoinsNames: freeze(["btc", "xmr", "prv"]),

  acceptedCoins: freeze({
    btc: freeze({
      needsShielding: true,
      coinID: "b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696",
    }),

    xmr: freeze({
      needsShielding: false,
      address: "484RLdsXQCDGSthNatGApRPTyqcCbM3PkM97axXezEuPZppimXmwWegiF3Et4BHBgjWR7sVXuEUoAeVNpBiVznhoDLqLV7j",
    }),

    prv: freeze({
      needsShielding: false,
      address:
        "12sdoBt4XsFUmNiyik3ZiuKMZnA9wv8cTf6QLctNQTeMrCu5HEkSXjPZF7KC2ncfLuGTW9sAUAeU59gVpoyydtWtP2KcYrr" +
        "CuNRfWJ4q5jsqpaRwLet8TLLvgH6zoBaYr7dDoSH8WVYqpPycLzG3",
    }),
  }),

  paymentAddress:
    "12sdoBt4XsFUmNiyik3ZiuKMZnA9wv8cTf6QLctNQTeMrCu5HEkSXjPZF7KC2ncfLuGTW9sAUAeU59gVpoyydtWtP2KcYrr" +
    "CuNRfWJ4q5jsqpaRwLet8TLLvgH6zoBaYr7dDoSH8WVYqpPycLzG3",
});
