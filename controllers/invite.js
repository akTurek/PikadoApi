import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createGame, createPlayer, getGameContext } from "./game.js";
import { games } from "../middleware/gameInfo.js";

dotenv.config();

//////
//Send invites
//////
//MOD
export const send = async (req, res) => {
  const { inviteList, groupId, type } = req.body;

  console.log("req.body:", JSON.stringify(req.body, null, 2));

  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const game = await createGame(type, groupId, userInfo.id); //create game db + ram return

    if (!game.success) {
      return res
        .status(500)
        .json({ error: "Game creation failed", details: game.error });
    }

    const gameId = game.gameId;

    const player = await createPlayer(userInfo.id, gameId, "admin", type); //create player db +ram

    const q2 = "INSERT INTO `game_invite` (user_id, game_id) VALUES (?,?)";

    for (const id of inviteList) {
      // CREATE INVITES FOR OTHER USERS
      const values2 = [id, gameId];

      const data2 = await db.promise().query(q2, values2);
    }

    const gameContext = getGameContext(gameId, player.playerId, userInfo.id);

    return res.status(200).json(gameContext);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get Invites
//////
//MOD

export const myInvites = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const q =
      "SELECT * FROM `game_invite` WHERE user_id = ? AND status = 'pending'";

    const [data] = await db.promise().query(q, [userInfo.id]);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

//////
//Accept Invite And Join Game
//////

export const accInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    const userInfo = await authToken(token);

    const q =
      "UPDATE `game_invite` SET status = 'accepted' WHERE user_id = ? AND id = ?";

    const values = [userInfo.id, inviteId];

    const [data] = await db.promise().query(q, values); //accept invite

    const q2 =
      "SELECT g.id AS gameId, g.type FROM game AS g JOIN `game_invite` AS i ON g.id = i.game_id WHERE i.id = ?";

    const [rows] = await db.promise().query(q2, [inviteId]);

    const { gameId, type } = rows[0];
    console.log(gameId + " gameId");

    const player = await createPlayer(userInfo.id, gameId, "member", type);
    const gameContext = getGameContext(gameId, player.playerId);

    return res.status(200).json(gameContext);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

//////
//Decline Invite
//////

export const decInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    const userInfo = await authToken(token);

    const q =
      "UPDATE `game_invite` SET status = 'declined' WHERE user_id = ? AND id = ?";

    const values = [userInfo.id, inviteId];

    const [data] = await db.promise().query(q, values); //decline invite

    return res.status(200).json("Povabilo zavrnjeno");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
