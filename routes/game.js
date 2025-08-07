import express from "express";
import { myGame, startGame } from "../controllers/game.js";

const router = express.Router();

router.get("/getinfo/:gameId", myGame);
router.put("/start/:gameId", startGame);

export default router;
