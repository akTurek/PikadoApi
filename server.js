import express from "express";
import userRouts from "./routes/auth.js";
import groupRouts from "./routes/group.js";
import membersRouts from "./routes/members.js";
import inviteRouts from "./routes/invite.js";
import friendsRouts from "./routes/friends.js";
import gameRouts from "./routes/game.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = 5000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Pozdravljen, Express!");
});

app.use("/api/members", membersRouts);
app.use("/api/users", userRouts);
app.use("/api/group", groupRouts);
app.use("/api/invites", inviteRouts);
app.use("/api/friends", friendsRouts);
app.use("/api/game", gameRouts);

app.listen(port, () => {
  console.log(`Strežnik teče na http://localhost:${port}`);
});
