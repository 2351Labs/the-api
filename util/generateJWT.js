const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      email: user.email,
      roles: user.roles,
      _id: user._id
    }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: "4h" } // Token expiration
  );
};
module.exports = generateToken;
