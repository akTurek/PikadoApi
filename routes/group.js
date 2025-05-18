import express from "express";
import {createGroup, deleteGroup, findGroup, groupData, joinGroup, myGroups} from "../controllers/group.js"

const router = express.Router()

router.post("/newgroup",createGroup);
router.get("/findgroup" ,findGroup);
router.get("/mygroups" ,myGroups);
router.post("/joingroup",joinGroup);
router.post("/getdata/:groupId", groupData);
router.delete("/delete/:groupId", deleteGroup);


export default router