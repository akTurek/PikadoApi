import express from "express";
import {findFriend,addFriend,accFriendInvite,decFriendInvite, getFriendsInvites, getAllFriends} from "../controllers/friends.js"



const router = express.Router()



router.get("/findfriend/:friendName",findFriend)
router.get("/getfriendsinvites",getFriendsInvites)
router.get("/getallfriends",getAllFriends)

router.post("/addfriend/:friendId",addFriend)
router.put("/acc/:inviteId",accFriendInvite)
router.put("/dec/:inviteId",decFriendInvite)


export default router