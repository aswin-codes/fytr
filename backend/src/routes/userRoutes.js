const Router = require("express").Router;
const {registerUser, loginUser, loginWithGoogle} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/register", authMiddleware, registerUser);
router.post("/login", authMiddleware ,loginUser);
router.post("/login-google", authMiddleware, loginWithGoogle);

module.exports = router;

