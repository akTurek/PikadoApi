import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import { games } from "../middleware/gameInfo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { json } from "express";

dotenv.config();

//////
//Create game
//////
//MOD

export const createGame = async (type, group_id, adminId) => {
  try {
    const q = "INSERT INTO game (`type`, group_id , status ) VALUES (?,?,?)";

    const values = [String(type), group_id, "waiting"];

    const [data] = await db.promise().query(q, values);

    const gameId = data.insertId;

    const game = {
      gameId,
      gameStatus: "waiting",
      type: type,
      players: [],
      adminId: adminId,
    };

    games.set(gameId, game);

    return {
      success: true,
      gameId,
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
//Insert playerId in Games map
//////
//MOD
export const createPlayer = async (userId, gameId, role, type) => {
  ////console.log("----------------------------------------------------");
  try {
    const q1 = "INSERT INTO user_game (user_id, game_id, role) VALUES (?,?,?)"; //create first user game * game admin

    const values1 = [userId, gameId, role];
    const [data] = await db.promise().query(q1, values1);

    const game = games.get(gameId);
    const q2 = "SELECT username FROM user WHERE id = ?";
    const [rows] = await db.promise().query(q2, [userId]);

    const turn = role === "admin" ? true : false;

    const player = {
      playerId: data.insertId,
      username: rows[0].username,
      score: type,
      turn,
      place: null,
    };

    ////console.log("PLAYER INFO:", JSON.stringify(player, null, 2));

    if (!game) {
      console.error(`Game ${gameId} not found in games map.`);
      return;
    }

    if (!Array.isArray(game.players)) {
      game.players = [];
    }

    game.players.push(player);

    return {
      success: true,
      playerId: data.insertId,
    };
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      success: false,
      error,
    };
  }
};

//////
//Get Game Context
//////
//MOD

export const getGameContext = (gameId, playerId, userId) => {
  const game = games.get(gameId);

  if (!game) {
    console.error(`Game ${gameId} not found.`);
    return null;
  }

  const player = game.players.find((p) => p.playerId === playerId);

  if (!player) {
    console.error(`Player ${playerId} not found in game ${gameId}.`);
    return null;
  }

  // Ustvari kontekst igre
  const gameContext = {
    gameId: game.gameId,
    gameStatus: game.gameStatus,
    isAdmin: userId == game.adminId,
    playerId: playerId,
    turn: player.turn,
  };

  ////console.log("GameContext: " + gameContext);

  return gameContext;
};

//////
//Get Game Data
//////
//MOD
export const myGame = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const gameId = Number.parseInt(req.query.gameId, 10);
    const playerId = Number.parseInt(req.query.playerId, 10);
    const data = getGameContext(gameId, playerId, userInfo.id);

    return res.status(200).json(data);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Change Game Status
//////
//MOD
export const changeStatus = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const { status } = req.body;
    const gameId = parseInt(req.params.gameId, 10);
    //Dodaj preveri ce je user res v game
    //preveri ce je admin
    //dodaj zapis v db

    const q = "UPDATE `game` SET `status` = ? WHERE `id` = ?";
    const [result] = await db.promise().query(q, [status, gameId]);

    const game = games.get(gameId);
    ////console.log("game status set " + status + " game id " + gameId);
    game.gameStatus = status;

    if (status == "finished") {
      await lastPlaces(game);
    } else if (status == "cancelled") {
      games.delete(gameId);
    }

    return res.status(200).json("Status set to active");
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Get List Of Players
//////
//MOD
export const getPlayers = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    //Dodaj preveri ce je user res v game
    //preveri ce je admin
    //dodaj zapis v db

    const gameId = parseInt(req.params.gameId, 10);

    const players = games.get(gameId).players;

    //console.log("PLAYER INFO:", JSON.stringify(players, null, 2));
    return res.status(200).json(players);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Update Score
//////
export const updateScore = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const playerId = parseInt(req.params.playerId, 10);
    const gameId = parseInt(req.params.gameId, 10);
    //console.log(gameId + " " + playerId);

    //Dodaj preveri ali je res uporabnik na vrsti

    const q1 = "INSERT INTO `turn`(`user_game_id`, `game_id`) VALUES (?,?)";
    const [rows] = await db.promise().query(q1, [playerId, gameId]);

    const q2 =
      "INSERT INTO `throw`  (`score`, `multiplier`,`turn_id`) VALUES (?,?,?)";
    const [rows2] = await db
      .promise()
      .query(q2, [req.body.score1, req.body.mul1, rows.insertId]);
    const [rows3] = await db
      .promise()
      .query(q2, [req.body.score2, req.body.mul2, rows.insertId]);
    const [rows4] = await db
      .promise()
      .query(q2, [req.body.score3, req.body.mul3, rows.insertId]);

    const game = games.get(gameId);
    const player = game.players.find((p) => p.playerId === playerId);
    player.score = Math.abs(
      player.score -
        (req.body.mul1 * req.body.score1 +
          req.body.mul2 * req.body.score2 +
          req.body.mul3 * req.body.score3)
    );

    switchTurn(gameId, playerId);

    if (player.score == 0) {
      player.place = await updatePlace(playerId, gameId, userInfo.id);
    }

    return res.status(200).json("ok");
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

export async function switchTurn(gameId, playerId) {
  const game = games.get(gameId);
  if (!game || !Array.isArray(game.players) || game.players.length === 0)
    return null;

  const curIdx = game.players.findIndex(
    (p) => String(p.playerId) === String(playerId)
  );
  if (curIdx === -1) return null;

  game.players[curIdx].turn = false;

  const len = game.players.length;
  let nextIdx = -1;
  for (let step = 1; step <= len; step++) {
    const idx = (curIdx + step) % len;
    const cand = game.players[idx];
    if (Number(cand.score ?? 0) > 0) {
      nextIdx = idx;
      break;
    }
  }

  if (nextIdx === -1) {
    game.players.forEach((p) => (p.turn = false));
    game.gameStatus = "finished";

    const q = "UPDATE `game` SET `status` = ? WHERE `id` = ?";
    const [result] = await db.promise().query(q, ["finished", gameId]);

    return null;
  }

  game.players.forEach((p, i) => (p.turn = i === nextIdx));
}

export const updatePlace = async (playerId, gameId, userId) => {
  try {
    const q =
      "SELECT MAX(`place`) AS max_place FROM `user_game`WHERE `game_id` = ?";
    const [result] = await db.promise().query(q, [gameId]);

    console.log(
      "TRENUTNO MESTO  -------------------------------- " + result[0].max_place
    );

    const place = result[0].max_place + 1;

    const q1 =
      "UPDATE `user_game` SET `place` = ? WHERE `id` = ? AND `user_id` = ? AND `game_id` = ?";
    const [result1] = await db
      .promise()
      .query(q1, [place, playerId, userId, gameId]);

    console.log("UPDATE MESTO  -------------------------------- " + place);
    return place;
  } catch (error) {
    //console.log(error);
    return;
  }
};

export const lastPlaces = async (game) => {
  try {
    const gameId = game.gameId;
    const q =
      "SELECT MAX(`place`) AS max_place FROM `user_game` WHERE `game_id` = ?";
    const [result] = await db.promise().query(q, [gameId]);

    console.log(
      "TRENUTNO MESTO  -------------------------------- " + result[0].max_place
    );

    const lastPlace = result[0].max_place + 1;

    const playersWithoutPlace = game.players.filter((p) => p.place == null);

    playersWithoutPlace.forEach(async (p) => {
      p.turn = false;
      p.place = lastPlace;
      p.score = 0;

      let playerId = p.playerId;

      const q1 =
        "UPDATE `user_game` SET `place` = ? WHERE `id` = ?  AND `game_id` = ?";
      const [result1] = await db
        .promise()
        .query(q1, [lastPlace, playerId, gameId]);
    });

    console.log("UPDATE MESTO  -------------------------------- " + lastPlace);
    return lastPlace;
  } catch (error) {
    console.log(error);
    return;
  }
};

//////
//leave Game
//////
//MOD
export const leaveGame = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const gameId = parseInt(req.params.gameId, 10);

    //dodaj
    const players = games.get(gameId).players;

    return res.status(200).json(players);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};
