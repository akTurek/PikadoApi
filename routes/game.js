import express from "express";
import {
  myGame,
  changeStatus,
  getPlayers,
  updateScore,
  leaveGame,
} from "../controllers/game.js";

const router = express.Router();

router.get("/getinfo", myGame);
router.put("/changestatus/:gameId", changeStatus);
router.get("/getplayers/:gameId", getPlayers);
router.put("/updatescore/:gameId/:playerId", updateScore);
router.delete("/leave/:gameId/:playerId", leaveGame);

export default router;
