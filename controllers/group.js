import jwt from "jsonwebtoken";
import {db} from "../database/dbConnect.js"
import dotenv from "dotenv";

dotenv.config();



export const createGroup = async (req, res) => {
    console.log(req.body);

    const token = req.cookies.accessToken;
    console.log("poslan piskotek: "+token)
    if (!token) return res.status(401).json("No token");

    try {
        const userInfo = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
                if (err) reject("Invalid Token");
                else resolve(decoded);
            });
        });

        const q = "INSERT INTO `Group` (`name`, `joinPassword`) VALUES (?, ?)";
        const values = [req.body.name, req.body.password1];

        const [data] = await db.promise().query(q, values);
        return res.status(200).json("Group Created");

    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
};
    