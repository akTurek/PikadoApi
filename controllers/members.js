import {db} from "../database/dbConnect.js"
import dotenv, { parse } from "dotenv";
import {authToken} from "../middleware/auth.js"

//////
// Get Members Of Group
//////

export const getMembers = async (req,res) =>{
    
    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const groupId = req.params.groupId;

        console.log("GET MEMBERS groupId, userId: "+groupId+" "+userInfo.id)

        const q = "SELECT ug.id, u.username, u.id AS userId, ug.num1st FROM user_group AS ug JOIN user AS u ON u.id = ug.user_id WHERE ug.group_id = ?"

        const [data] = await db.promise().query(q,[groupId]);
        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }

}

//////
//Change Ownership Of Group
//////

export const changeOwner = async (req,res) =>{

        const token = req.cookies.accessToken;
        console.log("poslan piskotek "+token)
        if (!token) return res.status(401).json("No token");

    
        try {
            const userInfo = await authToken(token)

            const groupId = req.body.groupId
            const newOwnerId = req.body.memberId

            console.log(groupId+" "+newOwnerId)

            const q = "SELECT id, role FROM user_group WHERE group_id = ? AND user_id = ?" //preveri ali je admin

            const [data]= await db.promise().query(q,[groupId,userInfo.id])

            const oldOwnerId= data[0].id
            const role = data[0].role

            if(role!=="admin"){
               
                return res.status(403).json("Only admin can transfer ownership");
               
            } 

            const q1 = "UPDATE user_group SET role = ? WHERE id =?"

            await db.promise().query(q1,["admin",newOwnerId])
            await db.promise().query(q1,["member", oldOwnerId ])

            return res.status(200).json("Ownership transferd")


        } catch (error) {
            console.error(error);
            return res.status(500).json(error);
        }
}

//////
//Kick Member From Group
//////

export const kickPlayer = async (req,res) =>{

    const token = req.cookies.accessToken;
    console.log("poslan piskotek "+token)
    if (!token) return res.status(401).json("No token");


    try {
        const userInfo = await authToken(token)

        const groupId = req.body.groupId
        const kickedPlayerId = req.body.memberId

        console.log(groupId +" "+ kickedPlayerId)

        const q = "SELECT role FROM user_group WHERE group_id = ? AND user_id = ?" //preveri ali je admin

        const [data]= await db.promise().query(q,[groupId,userInfo.id])

        const role = data[0].role

        if(role!=="admin"){
           
            return res.status(403).json("Only admin can kick players");
           
        } 

        const q1 = "DELETE FROM user_group WHERE id =?"

        await db.promise().query(q1,[kickedPlayerId])
        return res.status(200).json("kicked")


    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}

//////
//Leave Group
//////

export const leave = async (req,res) =>{

   
    const token = req.cookies.accessToken;
    console.log("LEAVE poslan piskotek "+token)
    if (!token) return res.status(401).json("No token");


    try {
        const userInfo = await authToken(token)
        const groupId = req.params.groupId


        console.log("LEAVE "+groupId +" "+ userInfo.id,)


        const q1 = "DELETE FROM user_group WHERE user_id =? AND group_id =?"

        await db.promise().query(q1,[userInfo.id, groupId])
        return res.status(200).json("You have leave group")


    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}