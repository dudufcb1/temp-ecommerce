const jwt = require("jsonwebtoken");
const StatusCodes = require("http-status-codes");

const createJwt = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

cookieExpireTime = 1000 * 60 * 60 * 24 * process.env.COOKIE_LIFETIME;

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJwt({ payload: user });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + cookieExpireTime),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  createJwt,
  isTokenValid,
  attachCookiesToResponse,
};
