import express from "express";
import { accInvite, decInvite, myInvites, send } from "../controllers/invite.js";

const router = express.Router()

router.post("/send", send);
router.get("/get", myInvites)
router.put("/acc/:inviteId", accInvite)
router.put("/dec/:inviteId", decInvite)

export default router