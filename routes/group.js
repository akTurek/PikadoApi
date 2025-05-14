import express from "express";
import {createGroup, findGroup, joinGroup, myGroups} from "../controllers/group.js"

const router = express.Router()

router.post("/newgroup",createGroup);
router.get("/findgroup" ,findGroup);
router.get("/mygroups" ,myGroups);
router.post("/joingroup",joinGroup);

export default router