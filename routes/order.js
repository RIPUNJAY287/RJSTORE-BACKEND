var express = require("express");
const auth = require("../middlewares/auth");
var router = express.Router();
const db = require("../admin").db;
const admin = require("../admin").admin;

router.post("/add", (req, res) => {
  console.log(req.body);
  var orderRef = db.collection("orders").doc(req.body.id);
  orderRef
    .set(req.body)
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/orderlist", (req, res) => {
  console.log(req.body.uid);
  var userorderRef = db.collection("users").doc(req.body.uid);
  userorderRef
    .get()
    .then((snapshot) => {
      const resp = snapshot.data();
      console.log(resp.orders);
      res.send(resp.orders);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/item", async (req, res) => {
  console.log(req.body.item);
  const orderRef = await db.collection("orders").doc(req.body.item);
  orderRef
    .get()
    .then((snapshot) => {
      const resp = snapshot.data();
      console.log(resp);
      res.send(resp);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "server error" });
    });
});
module.exports = router;
