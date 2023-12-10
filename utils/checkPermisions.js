const CustomError = require("../errors");

const checkPermisions = (requestUser, resourceUserId) => {
  //console.log(requestUser); el logueado
  //console.log(resourceUserId); el que se recupero desde mongo
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not authorizated to access this route"
  );
};

module.exports = checkPermisions;
