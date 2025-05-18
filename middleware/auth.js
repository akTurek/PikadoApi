import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authToken  = async(token) =>{        
            return await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
                if (err) reject("Invalid Token");
                else resolve(decoded);
            });
        });
}




    