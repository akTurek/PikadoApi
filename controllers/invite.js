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



}