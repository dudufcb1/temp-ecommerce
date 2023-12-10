const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsersController,
  getSingleUserController,
  showCurrentUserController,
  updateUserController,
  updateUserPasswordController,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsersController);
router.route("/showMe").get(authenticateUser, showCurrentUserController);
router.route("/updateUser").patch(authenticateUser, updateUserController);
router
  .route("/updatePassword")
  .patch(authenticateUser, updateUserPasswordController);
router.route("/:id").get(authenticateUser, getSingleUserController);

module.exports = router;
