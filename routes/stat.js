import express from "express";
import { getNS, getGS } from "../controllers/stat.js";

const router = express.Router();

router.get("/ns", getNS);
router.get("/gs", getGS);

export default router;
