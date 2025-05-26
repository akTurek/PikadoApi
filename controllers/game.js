import {db} from "../database/dbConnect.js"
import dotenv from "dotenv";
import {authToken} from "../middleware/auth.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

//////
//Create game
//////

export const createGame = async (type, group_id) => {
    
    try {

        const q = "INSERT INTO game (`type`, group_id ) VALUES (?,?)"

        const values = [
            type,
            group_id
        ]

        const [data] = await db.promise().query(q,values)


        console.log("Create game "+data.insertId)
        
        return{
            success: true,
            gameId: data.insertId
        }

    } catch (error) {
        console.error("Error creating game:", error);
        return {
            success: false,
            error
        };
    }
};