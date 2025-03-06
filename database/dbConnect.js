import mysql from 'mysql2';
import dotenv from 'dotenv';

//Naloži `.env` datoteko
dotenv.config();

// Ustvari povezavo z MySQL
export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
});
