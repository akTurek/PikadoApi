import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//////
//Get list of people matching searce friend name
//////
//MOD

export const findFriend = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const friendName = req.params.friendName;

  try {
    await authToken(token);

    console.log("Friend Name " + friendName);

    const q = "SELECT id, username, img FROM user WHERE username = ?";

    const [data] = await db.promise().query(q, [friendName]);

    console.log(data[0]);

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Send invite to new friend
//////
//MOD

export const addFriend = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const friendId = req.params.friendId;

  try {
    const userInfo = await authToken(token);

    console.log("Friend id " + friendId);

    const q =
      "INSERT INTO friendship (`user_id_sender`, `user_id_receiver`) VALUES (?,?)";

    const [data] = await db.promise().query(q, [userInfo.id, friendId]);

    return res.status(200).json("Invite was send");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Accept invite to new friend
//////
//MOD?
export const accFriendInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    await authToken(token);

    const q = "UPDATE friendship SET status = 'accepted' WHERE id = ?";

    const [data] = await db.promise().query(q, [inviteId]);

    return res.status(200).json("Invite was Acc");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Decline invite to new friend
//////
//MOD ?
export const decFriendInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    await authToken(token);

    const q = "UPDATE friendship SET status = 'declined' WHERE id = ?";

    const [data] = await db.promise().query(q, [inviteId]);

    return res.status(200).json("Invite was DEXCLINED");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get list of friend invites
/////
//MOD

export const getFriendsInvites = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    const userInfo = await authToken(token);
    const q =
      "SELECT f.id, u.username FROM friendship AS f JOIN user AS u ON f.user_id_sender = u.id WHERE user_id_receiver= ? AND f.status = 'pending'";

    const [data] = await db.promise().query(q, [userInfo.id]);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get list of friends
//////
//MOD ?

export const getAllFriends = async (req, res) => {
  console.log("Pregled prijateljev");

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const q = `SELECT DISTINCT u.id, u.username FROM friendship f JOIN user u ON (f.user_id_receiver = ? AND f.user_id_sender = u.id) OR (f.user_id_sender = ? AND f.user_id_receiver = u.id) WHERE f.status = 'accepted' AND u.id != ?`;
    const [data] = await db
      .promise()
      .query(q, [userInfo.id, userInfo.id, userInfo.id]);

    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Unfriend
//////
//MOD
export const deliteFriend = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const friendId = req.params.friendId;

  try {
    const userInfo = await authToken(token);

    const q =
      "DELETE FROM friendship WHERE (user_id_receiver = ? AND user_id_sender = ?) OR (user_id_sender = ? AND user_id_receiver = ?)";

    const [data] = await db
      .promise()
      .query(q, [friendId, userInfo.id, friendId, userInfo.id]);

    console.log("unfriend was succ");

    return res.status(200).json("Unfriend was sucessfuls");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
