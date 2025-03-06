import {db} from "../database/dbConnect.js"

export const login = async () => {




    
    try {
        const [rows] = await db.promise().query("SELECT * FROM User");
        console.log("✅ Podatki:", rows);
        return rows;
    } catch (err) {
        console.error("❌ Napaka pri poizvedbi:", err);
    }
};


