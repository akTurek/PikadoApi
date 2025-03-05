import express from 'express';
import {db} from "./database/dbConnect.js"
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Pozdravljen, Express!');
});

app.listen(port, () => {
    console.log(`Strežnik teče na http://localhost:${port}`);
});

