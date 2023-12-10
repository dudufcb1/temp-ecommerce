const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermisions,
} = require("../utils");

// Controlador para obtener todos los usuarios
const getAllUsersController = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json(users);
};

// Controlador para obtener un solo usuario
const getSingleUserController = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  //req es el logueado user es el que se recupera (podria ser cualquier)
  checkPermisions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

// Controlador para mostrar el usuario actual
const showCurrentUserController = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUserController = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide both values");
  }
  //le pedimos a req.body que nos regale le id, para buscar
  const user = await User.findOne({ _id: req.user.userId });
  console.log(email);
  //asignamos nuevos valores
  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// Controlador para actualizar la contraseña de un usuario
const updateUserPasswordController = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Sucess! Password Updated" });
};
module.exports = {
  getAllUsersController,
  getSingleUserController,
  showCurrentUserController,
  updateUserController,
  updateUserPasswordController,
};

/* // Controlador para actualizar un usuario
const updateUserController = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide both values");
  }

  // 3 objetos, criterio de busqueda, campos a actualizar, correr validadores para no actualizar sin ellos
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  );
  console.log(user);
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
 */
