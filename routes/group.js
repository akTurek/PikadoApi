import express from "express";
import {createGroup} from "../controllers/group.js"

const router = express.Router()

router.post("/newgroup",createGroup)

export default router