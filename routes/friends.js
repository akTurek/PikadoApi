import express from "express";
import {
  findFriend,
  addFriend,
  accFriendInvite,
  decFriendInvite,
  getFriendsInvites,
  getAllFriends,
  deliteFriend,
} from "../controllers/friends.js";

const router = express.Router();

router.get("/findfriend/:friendName", findFriend);
router.get("/getfriendsinvites", getFriendsInvites);
router.get("/getallfriends", getAllFriends);

router.post("/addfriend/:friendId", addFriend);
router.put("/acc/:inviteId", accFriendInvite);
router.put("/dec/:inviteId", decFriendInvite);
router.delete("/unfriend/:friendId", deliteFriend);

export default router;
