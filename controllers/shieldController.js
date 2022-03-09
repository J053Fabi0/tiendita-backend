const handleError = require("../utils/handleError");
const incognitoCli = require("../utils/incognitoCli");
const { acceptedCoins, paymentAddress, acceptedCoinsNames } = require("../utils/constants");

const a = {};

a.getShieldAddress = async ({ query: { coin } }, res) => {
  try {
    const coinInfo = acceptedCoins[coin];

    if (coinInfo.needsShielding)
      return res.send({ message: await incognitoCli.shieldAddress(paymentAddress, coinInfo.coinID) });

    res.send({ message: coinInfo.address });
  } catch (e) {
    handleError(res, e);
  }
};

a.getAcceptedCoins = (_, res) => {
  try {
    res.send({ message: acceptedCoinsNames });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
