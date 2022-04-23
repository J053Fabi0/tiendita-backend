const jwt = require("jsonwebtoken");
const { usersDB } = require("../db/collections/collections");

module.exports = (req, res, next) =>
  jwt.verify(
    req?.headers?.authorization || "",

    process.env.API_SECRET, //

    (error, decode) => {
      if (error) return res.status(403).send({ message: "Invalid JWT token", error });

      const user = usersDB.findOne({ $loki: decode.id });
      if (!user) return res.status(404).send({ message: "User not found." });

      const { password: _, meta: __, $loki: id, ...userData } = user;
      req.user = { ...userData, id };
      next();
    }
  );
