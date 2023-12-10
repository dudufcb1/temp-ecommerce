const CustomError = require("../errors");
const {
  isTokenValid
} = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Auth Failed");
  } else {
    try {
      const payload = isTokenValid({
        token
      });
      //Se asigna para que se vaya a las cabeceras, se propague, pero solo en las que
      // el middleware pasa, no hace la cabecera global, solo por las que pasó el middleware

      req.user = {
        name: payload.name,
        userId: payload.userId, //Estabas agregando el _id de mongo y en req.user viene userId
        role: payload.role,
      };
      //
      next();
    } catch (error) {
      throw new CustomError.UnauthenticatedError("Auth Failed");
    }
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthenticatedError("No permissions");
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};