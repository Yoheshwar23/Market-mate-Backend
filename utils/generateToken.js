const jwt = require("jsonwebtoken");

function generateToken(createdUser) {
  return jwt.sign(
    { email: createdUser.email, id: createdUser._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

module.exports.generateToken = generateToken;
