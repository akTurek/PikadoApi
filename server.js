import express from 'express';
import {db} from "./database/dbConnect.js"
import userRouts from "./routes/auth.js";


const app = express();
const port = 5003;

app.use(express.json());


   

app.get('/', (req, res) => {
    res.send('Pozdravljen, Express!');
});

app.use('/api/users',userRouts)




app.listen(port, () => {
    console.log(`Strežnik teče na http://localhost:${port}`);
});


