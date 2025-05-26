import {db} from "../database/dbConnect.js"
import dotenv from "dotenv";
import {authToken} from "../middleware/auth.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

//////
//Creat Grup
//////

export const createGroup = async (req, res) => {
    console.log(req.body);

    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password1, salt);
    

        const q = "INSERT INTO `group` (`name`, `joinPassword`) VALUES (?, ?)";
        
        const values = [
            req.body.groupName, 
            hashedPassword
        ];

        const [data] = await db.promise().query(q, values);

        const q2 = "INSERT INTO `user_group` (`role`, `user_id`,`group_id`) VALUES (?, ?,?)";

        const values2 = [
            "admin",
            userInfo.id, 
            data.insertId
        ];
        
        const [data2] = await db.promise().query(q2, values2);
        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
};

export const findGroup = async (req, res) => {
    console.log(req.query.groupId);

    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);
       
        const q = "SELECT * FROM `group` WHERE id = ?";
        
        const [data] = await db.promise().query(q, [req.query.groupId]);

        const {joinPassword, ...other} =data[0];

        return res.status(200).json(other);

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
};



export const joinGroup = async (req, res) => { //preveri da se ne pridruzi skupini dvakrat

   console.log(req.body)

    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const q = "SELECT * FROM `group` WHERE id = ?";

        const [data] = await db.promise().query(q, [req.body.groupId]); 

        if (data.length == 0) return res.status(404).json("Uporabnik ne obstaja");

        const checkedPass = bcrypt.compareSync(req.body.password, data[0].joinPassword);  

        if (!checkedPass) return res.status(400).json("Napacno geslo");

        
        const q2 = "INSERT INTO `user_group` (`role`, `user_id`,`group_id`) VALUES (?, ?,?)";

        const values2 = [
            "member",
            userInfo.id, 
            req.body.groupId
        ];
        
        const [data2] = await db.promise().query(q2, values2);
        
        const {joinPassword, ...other} =data[0];

        console.log("dodal clana"+other)
        return res.status(200).json(other);

    } catch (err) {
        console.error("Napaka pri poizvedbi:", err);
        return res.status(500).json("Napaka strežnika");
    }
};


export const myGroups = async (req, res) => {


    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const q = "SELECT g.name, g.id AS id FROM `group` g JOIN `user_group` ug ON g.id = ug.group_id WHERE ug.user_id = ?";

        const [data] = await db.promise().query(q, userInfo.id); 

        if (data.length == 0) return res.status(404).json("Nisi clan skupin");

        console.log(data)

        return res.status(200).json(data);

    } catch (err) {
        console.error("Napaka pri poizvedbi:", err);
        return res.status(500).json(err);
    }
};


export const groupData = async(req,res) => {


    const token = req.cookies.accessToken;
    console.log("MY GROUP poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {

        const userInfo = await authToken(token);

        const groupId = req.params.groupId

        const q = "SELECT g.name, g.id , ug.id AS userGroupId , ug.role  FROM `group` g JOIN `user_group` ug ON g.id = ug.group_id WHERE ug.user_id = ? AND g.id = ?";

        const [data] = await db.promise().query(q, [userInfo.id, groupId]); 

        if (data.length == 0) return res.status(404).json("Nisi clan skupin");


         const groupToken = jwt.sign( data[0], process.env.SECRETKEY, { expiresIn: "1h" });
        
        
                res.cookie("groupToken", groupToken, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000 // 1 ura
                }).status(200).json(data[0]);
        

    } catch (err) {
        console.error("Napaka pri poizvedbi:", err);
        return res.status(500).json(err);
    }
};

export const leaveGroupPage =(req,res)=>{
    res.clearCookie("groupToken",{
        httpOnly: true,
    }).status(200).json("You have leaved group page")
}


export const deleteGroup = async (req,res) =>{

   
    const token = req.cookies.accessToken;
    console.log("DELETEGROUP poslan piskotek "+token)
    if (!token) return res.status(401).json("No token");

    const groupToken = req.cookies.groupToken;
    console.log("DELETEGROUP poslan piskotek "+groupToken)
    if (!token) return res.status(401).json("No token");


    try {
        const userInfo = await authToken(token)
        const groupInfo = await authToken(groupToken)
        console.log("Group info "+ groupInfo.id)
        console.log("User info "+ userInfo.id)
        
        const q = "SELECT role FROM user_group WHERE id = ? AND user_id = ? AND group_id = ?"

        const [data] = await db.promise().query(q, [groupInfo.userGroupId, userInfo.id, groupInfo.id ]); 

        if(!data[0].role == "admin"){
            return res.status(500).json("Only admin can delite")
        }

        const q1 = "DELETE FROM `group` WHERE id = ?"

        const [data2] = await db.promise().query(q1, [groupInfo.id ]); 

        
        return res.status(200).json("You have deleted group")


    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
}