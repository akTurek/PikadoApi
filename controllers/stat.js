import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//////
//Get list of number stats
//////
//MOD

export const getNS = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const q = `
        SELECT 
            SUM(place = 1) AS num1st,
            ROUND(SUM(place = 1) / NULLIF(COUNT(*), 0) * 100, 2) AS winRate,
            ROUND(AVG(place), 2) AS averagePlace
        FROM user_game
        WHERE user_id = ?`;

    const [data] = await db.promise().query(q, [userInfo.id]);

    const q1 = `
        SELECT 
            ROUND(AVG(th.score * th.multiplier), 2) AS avgPointsPerThrow
        FROM \`throw\` th
        JOIN \`turn\` t
            ON t.id = th.turn_id
        JOIN user_game ug
        ON ug.id = t.user_game_id
    WHERE ug.user_id = ?`;
    const [data1] = await db.promise().query(q1, [userInfo.id]);

    const q2 = `
SELECT
  th.score,
  th.multiplier,
  th.score * th.multiplier AS points,
  COUNT(*) AS hits
FROM \`throw\` th
JOIN \`turn\` t
  ON t.id = th.turn_id
JOIN user_game ug
  ON ug.id = t.user_game_id
WHERE ug.user_id = ?
GROUP BY th.score, th.multiplier
ORDER BY hits DESC
LIMIT 1
`;

    const [data2] = await db.promise().query(q2, [userInfo.id]);

    console.log(data[0]);
    console.log(data1);

    const result = {
      num1st: data[0]?.num1st ?? 0,
      winRate: data[0]?.winRate ?? 0,
      averagePlace: data[0]?.averagePlace ?? 0,
      avgPointsPerThrow: data1[0]?.avgPointsPerThrow ?? 0,
      hotM: data2[0]?.multiplier ?? 0,
      hotS: data2[0]?.score ?? 0,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get list of number stats
//////
//MOD

export const getGS = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const q = `
SELECT *
FROM (
  SELECT
    g.id AS gameId,
    DATE(g.timestamp) AS date,
    ROUND(AVG(tt.total_score), 2) AS averageTurn,
    MAX(tt.total_score) AS topTurn
  FROM game g
  JOIN \`turn\` t
    ON t.game_id = g.id
  JOIN (
    SELECT th.turn_id, SUM(th.score * th.multiplier) AS total_score
    FROM \`throw\` th
    GROUP BY th.turn_id
  ) AS tt
    ON tt.turn_id = t.id
  JOIN user_game ug
    ON ug.id = t.user_game_id
  WHERE ug.user_id = ?
  GROUP BY g.id, DATE(g.timestamp)
  ORDER BY g.timestamp DESC
  LIMIT 50
) AS recent_games
ORDER BY date ASC;
`;

    const [data] = await db.promise().query(q, [userInfo.id]);
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
