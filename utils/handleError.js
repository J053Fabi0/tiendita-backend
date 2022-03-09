module.exports = (res, err, code = 400) => {
  console.log(err);
  res.status(code).send({ message: null, error: err?.message || err });
};
