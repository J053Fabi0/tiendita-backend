module.exports = (res, err, code = 400) => {
  if (process.env.NODE_ENV !== "test") console.log(err);
  res.status(code).send({ message: null, error: err?.message || err });
};
