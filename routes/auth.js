import express from "express";
import {
  login,
  register,
  logout,
  changePassword,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.put("/changepassword", changePassword);

export default router;
