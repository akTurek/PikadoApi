import { db } from "../database/dbConnect.js";
import dotenv from "dotenv";
import { authToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

//////
//Creat Grup
//////
//MOD
export const createGroup = async (req, res) => {
  //console.log(req.body);

  const token = req.cookies.accessToken;
  //console.log("poslan piskotek: " + token);
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password1, salt);

    const q = "INSERT INTO `group` (`name`, `password`) VALUES (?, ?)";

    const values = [req.body.groupName, hashedPassword];

    const [data] = await db.promise().query(q, values);

    const q2 =
      "INSERT INTO `user_group` (`role`, `user_id`,`group_id`) VALUES (?, ?,?)";

    const values2 = ["admin", userInfo.id, data.insertId];

    const [data2] = await db.promise().query(q2, values2);
    return res.status(200).json(data);
  } catch (error) {
    //console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Fing Grup To Join
//////
//MOD
export const findGroup = async (req, res) => {
  //console.log("group name " + req.query.groupName);

  const token = req.cookies.accessToken;
  //console.log("poslan piskotek: " + token);
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const q = "SELECT * FROM `group` WHERE name = ?";

    const [data] = await db.promise().query(q, [req.query.groupName]);

    //console.log([data]);

    const { password, ...other } = data[0];

    return res.status(200).json(other);
  } catch (error) {
    //console.error(error);
    return res.status(500).json(error);
  }
};

//////
//Join Grup
//////
//MOD ne dela ce si bil kickan
export const joinGroup = async (req, res) => {
  //preveri da se ne pridruzi skupini dvakrat

  console.log("Prejel podateke id " + req.body.groupId);
  console.log("Prejel podateke name" + req.body.password);

  const token = req.cookies.accessToken;
  console.log("poslan piskotek: " + token);
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const q = "SELECT * FROM `group` WHERE id = ?";

    const [data] = await db.promise().query(q, [req.body.groupId]);

    if (data.length == 0) return res.status(404).json("Skupina ne obstaja");

    const checkedPass = bcrypt.compareSync(req.body.password, data[0].password);

    if (!checkedPass) return res.status(400).json("Napacno geslo");

    const q2 =
      "INSERT INTO `user_group` (`role`, `user_id`,`group_id`) VALUES (?, ?,?)";

    const values2 = ["member", userInfo.id, req.body.groupId];

    const [data2] = await db.promise().query(q2, values2);

    const { password, ...other } = data[0];

    console.log("dodal clana" + other);
    return res.status(200).json(other);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json("Napaka strežnika");
  }
};

//////
//Get List Of My Grup
//////
//MOD ?
export const myGroups = async (req, res) => {
  const token = req.cookies.accessToken;
  console.log("poslan piskotek: " + token);
  if (!token) return res.status(401).json("No token");

  console.log("Sem tukaj da podam skupine");

  try {
    const userInfo = await authToken(token);

    const q =
      "SELECT g.name, g.id AS id FROM `group` g JOIN `user_group` ug ON g.id = ug.group_id WHERE ug.user_id = ?";

    const [data] = await db.promise().query(q, userInfo.id);

    if (data.length == 0) return res.status(404).json("Nisi clan skupin");
    console.log(data + "--------------------------------");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Get Group Data
//////
//MOD ?
export const groupData = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);

    const groupId = req.params.groupId;

    const q =
      "SELECT g.name, g.id , ug.id AS userGroupId , ug.role  FROM `group` g JOIN `user_group` ug ON g.id = ug.group_id WHERE ug.user_id = ? AND g.id = ?";

    const [data] = await db.promise().query(q, [userInfo.id, groupId]);

    if (data.length == 0) return res.status(404).json("Nisi clan skupin");

    res.status(200).json(data[0]);
  } catch (err) {
    console.error("Napaka pri poizvedbi:", err);
    return res.status(500).json(err);
  }
};

//////
//Delite Group
//////
//MOD
export const deleteGroup = async (req, res) => {
  const token = req.cookies.accessToken;
  //console.log("DELETEGROUP poslan piskotek " + token);
  if (!token) return res.status(401).json("No token");

  try {
    const userInfo = await authToken(token);
    console.log("User info " + userInfo.id);
    const groupId = req.params.groupId;

    const q = "SELECT role FROM user_group WHERE user_id = ? AND group_id = ?";

    const [data] = await db.promise().query(q, [userInfo.id, groupId]);

    if (!data[0].role == "admin") {
      return res.status(500).json("Only admin can delite");
    }

    const q1 = "DELETE FROM `group` WHERE id = ?";

    const [data2] = await db.promise().query(q1, [groupId]);

    return res.status(200).json("You have deleted group");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
