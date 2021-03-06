const router = require("express").Router();
const user = require("../controllers/user");
const auth = require("../configs/auth.js");

router.get("/", user.getCart);
router.patch("/", auth, user.addCart);
router.delete("/", auth, user.reduceCart);
router.post("/", auth, user.checkout);

module.exports = router;
