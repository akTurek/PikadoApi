import {db} from "../database/dbConnect.js"
import dotenv from "dotenv";
import {authToken} from "../middleware/auth.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createGame } from "./game.js";

dotenv.config();

//////
//Send invites
//////

export const send = async (req, res) => {
    

    const { inviteList, groupId,type } = req.body
    console.log("Send invites prejel invite list: "+inviteList+ " group id "+groupId+" tip "+type);

    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const game = await createGame(type, groupId); //create game

        if(!game.success){
            return res.status(500).json({ error: "Game creation failed", details: game.error });
        }

        const gameId = game.gameId;

        console.log("Send gameId " +gameId)
        

        const q1 = "INSERT user_game (user_id, game_id, role, score ) VALUES (?,?,?,?)" //create first user game * game admin

        const values1 = [
            userInfo.id,
            gameId,
            "admin",
            type
        ]

        await db.promise().query(q1,values1)

        const q2 ="INSERT INTO invite (user_id, game_id) VALUES (?,?)"

        for (const id of inviteList) {

            const values2 =[
                id,
                gameId
            ]

            const data2 =await db.promise().query(q2,values2)
                
        }

        return res.status(200).json(gameId);

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
};

//////
//Get Invites
//////


export const myInvites = async(req,res)=>{

    const token = req.cookies.accessToken;
    console.log("MYINVITES poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const q ="SELECT * FROM invite WHERE user_id = ? AND status = 'pending'"

        const [data] = await db.promise().query(q,[userInfo.id])
        console.log("MYINVITES "+ JSON.stringify(data))

        return res.status(200).json(data)

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }

}

//////
//Accept Invite And Join Game
//////

export const accInvite = async (req,res)=>{
    const token = req.cookies.accessToken;
    console.log("ACCINVITE poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    const inviteId = req.params.inviteId

    try {

        const userInfo = await authToken(token);

        const q ="UPDATE invite SET status = 'accepted' WHERE user_id = ? AND id = ?"

        const values =[
            userInfo.id,
            inviteId
        ]

        const [data] = await db.promise().query(q,values) //accept invite

        const q2 ="SELECT g.id, g.type FROM game AS g JOIN invite AS i ON g.id = i.game_id WHERE i.id = ?"


        const [data2] = await db.promise().query(q2,[inviteId]) //accept invite
        console.log("MYINVITES "+ JSON.stringify(data))
        const { gameId, type }=data2[0]

        const q3 = "INSERT user_game (user_id, game_id, role, score ) VALUES (?,?,?,?)" //create  user game 

        const values3 = [
            userInfo.id,
            gameId,
            "player",
            type
        ]

        await db.promise().query(q3,values3)

        return res.status(200).json("Povabilo sprejeto")

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }

}


//////
//Decline Invite And Join Game
//////

export const decInvite = async (req,res)=>{
    const token = req.cookies.accessToken;
    console.log("ACCINVITE poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    const inviteId = req.params.inviteId

    try {

        const userInfo = await authToken(token);

        const q ="UPDATE invite SET status = 'declined' WHERE user_id = ? AND id = ?"

        const values =[
            userInfo.id,
            inviteId
        ]

        const [data] = await db.promise().query(q,values) //decline invite

        return res.status(200).json("Povabilo zavrnjeno")

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }

}

