const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createJwt,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

// Controlador para mostrar un mensaje de registro
const registerController = async (req, res) => {
  const { email, name, password } = req.body; //Se desestructura para que no se puedan registrar como admin
  checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new CustomError.BadRequestError(
      "Please use an unregistered email, did you lose your password?"
    );
  }
  if (req.body.role) {
    throw new CustomError.BadRequestError("Trying to hack?");
  }
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const user = await User.create({ email, name, password, role });
  //segun machiko se asignan valores a los props aca abajo ESTO ES EL PAYLOAD
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// Controlador para mostrar un mensaje de inicio de sesión
const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  //segun machiko se asignan valores a los props aca abajo ESTO ES EL PAYLOAD
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// Controlador para mostrar un mensaje de cierre de sesión
const logoutController = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

module.exports = {
  registerController,
  loginController,
  logoutController,
};
