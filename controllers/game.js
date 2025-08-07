import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import { games } from "../middleware/gameInfo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { json } from "express";

dotenv.config();

//////
//Insert game in Games map
//////
export const pushGame = (gameId, ownerId) => {
  const game = {
    gameId: gameId,
    gameStatus: "waiting",
    type: "501",
    players: [],
    ownerId: ownerId,
    turnIndex: 0,
  };

  //console.log("gameId v pushGame " + gameId);
  games.set(gameId, game);
  pushPlayer(ownerId, gameId);
};

//////
//Insert playerId in Games map
//////
export const pushPlayer = async (playerId, gameId) => {
  const game = games.get(gameId);

  const q = "SELECT username FROM user WHERE id = ?";

  const [rows] = await db.promise().query(q, playerId);

  const player = {
    playerId: playerId,
    score: game.type,
    username: rows[0].username,
  };

  if (!game) {
    console.error(`Game ${gameId} not found in games map.`);
    return;
  }

  if (!Array.isArray(game.players)) {
    game.players = [];
  }

  game.players.push(player);
  //console.log(` Game ${gameId} state:`, JSON.stringify(game, null, 2));
};

//////
//Create game
//////

export const createGame = async (type, group_id, ownerId) => {
  try {
    const q = "INSERT INTO game (`type`, group_id ) VALUES (?,?)";

    const values = [type, group_id];

    const [data] = await db.promise().query(q, values);

    //console.log("Create game " + data.insertId);

    pushGame(data.insertId, ownerId);

    const fullGame = games.get(data.insertId);

    return {
      success: true,
      gameId: data.insertId,
      fullGame: fullGame,
    };
  } catch (error) {
    console.error("Error creating game:", error);
    return {
      success: false,
      error,
    };
  }
};

//////
//Get Game Data
//////
export const myGame = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    //Dodaj preveri ce je user res v game

    const gameId = parseInt(req.params.gameId, 10);

    const fullGame = games.get(gameId);

    // console.log(
    //   "refatch game info --------------------------------------------------------------" +
    //     fullGame
    // );

    // console.log(gameId + " GameId poslan");

    return res.status(200).json(fullGame);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Change Game Status
//////
export const startGame = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const { status } = req.body;
    //Dodaj preveri ce je user res v game
    //preveri ce je admin
    //dodaj zapis v db

    const gameId = parseInt(req.params.gameId, 10);

    const fullGame = games.get(gameId);
    fullGame.gameStatus = status;
    console.log("game status set " + status + "game id " + gameId);

    return res.status(200).json("Status set to active");
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};
