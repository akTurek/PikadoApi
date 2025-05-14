import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {db} from "../database/dbConnect.js"
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {

    console.log(req.body)
    try {
        const q = "SELECT * FROM user WHERE username = ?";
        const [rows] = await db.promise().query(q, [req.body.username]); 

        if (rows.length == 0) return res.status(404).json("Uporabnik ne obstaja");

        const checkedPass = bcrypt.compareSync(req.body.password, rows[0].password);  

        if (!checkedPass) return res.status(400).json("Napačno uporabniško ime ali geslo");

        const token = jwt.sign({ id: rows[0].id }, process.env.SECRETKEY, { expiresIn: "1h" });

        const { password, ...other } = rows[0]; 

        res.cookie("accessToken", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000 // 1 ura
        }).status(200).json(other);

        console.log("poslan cookie "+token)

    } catch (err) {
        console.error("Napaka pri poizvedbi:", err);
        return res.status(500).json("Napaka strežnika");
    }
};


export const register = async (req, res) => {



    try {
        const q = "SELECT * FROM user WHERE username = ?";
        const [rows]= await db.promise().query(q, [req.body.username]); //[] samo podatki brez meta data

        if (rows.length ) return res.status(400).json("Uporabnik ze obstaja");

        const q2 = "INSERT INTO user (`username`,`password`,`email`) VALUES (?,?,?)";

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);


        const value = [
            req.body.username,
            hashedPassword,
            req.body.email
        ]

        const data = await db.promise().query(q2,value)

        return res.status(201).json("Registriran")

    } catch (err) {
        console.error("Napaka pri poizvedbi:", err);
        return res.status(500).json("Napaka strežnika");
    }

    
};


export const logout =(req,res)=>{
    res.clearCookie("accessToken",{
        httpOnly: true,
    }).status(200).json("User has been logged out")
}
