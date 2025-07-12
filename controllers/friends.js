import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//////
//Get list of people matching searce friend name
//////

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

export const addFriend = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const friendId = req.params.friendId;

  try {
    const userInfo = await authToken(token);

    console.log("Friend id " + friendId);

    const q = "INSERT INTO friendships (`user_id_1`, `user_id_2`) VALUES (?,?)";

    const [data] = await db.promise().query(q, [friendId, userInfo.id]);

    return res.status(200).json("Invite was send");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Accept invite to new friend
//////

export const accFriendInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    await authToken(token);

    const q = "UPDATE friendships SET status = 'accepted' WHERE id = ?";

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

export const decFriendInvite = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    await authToken(token);

    const q = "UPDATE friendships SET status = 'blocked' WHERE id = ?";

    const [data] = await db.promise().query(q, [inviteId]);

    return res.status(200).json("Invite was Acc");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get list of friend invites
/////

export const getFriendsInvites = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const inviteId = req.params.inviteId;

  try {
    const userInfo = await authToken(token);

    const q =
      "SELECT f.id, u.username FROM friendships AS f JOIN user AS u ON f.user_id_2 = u.id WHERE user_id_1 = ? AND f.status = 'pending'";

    const [data] = await db.promise().query(q, [userInfo.id]);

    console.log("moja povabila " + data);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Get list of friends
//////

export const getAllFriends = async (req, res) => {
  console.log("Pregled prijateljev");

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const q = `SELECT DISTINCT u.id, u.username FROM friendships f JOIN user u ON (f.user_id_1 = ? AND f.user_id_2 = u.id) OR (f.user_id_2 = ? AND f.user_id_1 = u.id) WHERE f.status = 'accepted' AND u.id != ?`;
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

export const deliteFriend = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  const friendId = req.params.friendId;

  try {
    const userInfo = await authToken(token);

    const q =
      "DELETE FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_2 = ? AND user_id_1 = ?)";

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
