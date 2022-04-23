const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { usersDB } = require("../db/collections/collections");

exports.signup = ({ body }, res) => {
  const user = usersDB.insertOne({
    role: body.role,
    email: body.email,
    fullName: body.fullName,
    password: bcrypt.hashSync(body.password, 8),
  });

  res.status(200).send({ message: "User Registered successfully", id: user.$loki });
};

exports.signin = ({ body }, res) => {
  const user = usersDB.findOne({ email: body.email });

  if (!user) return res.status(404).send({ message: "User Not found." });

  // comparing passwords.
  if (!bcrypt.compareSync(body.password, user.password))
    return res.status(401).send({ message: "Invalid password" });

  // signing token with user id
  var token = jwt.sign({ id: user.$loki }, process.env.API_SECRET);

  // responding to client request with user profile success message and access token.
  res.status(200).send({
    user: {
      id: user.$loki,
      email: user.email,
      fullName: user.fullName,
    },
    message: "Login successfull",
    accessToken: token,
  });
};
