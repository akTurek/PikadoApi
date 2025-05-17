import express from "express";
import {changeOwner, getMembers, kickPlayer, leave} from "../controllers/members.js"

const router = express.Router()


router.get("/getmembers/:groupId" ,getMembers);
router.put("/newOwner", changeOwner);
router.delete("/kick", kickPlayer);
router.delete("/leave/:groupId", leave);


export default router