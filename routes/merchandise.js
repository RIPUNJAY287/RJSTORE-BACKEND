var express = require("express");
const auth = require("../middlewares/auth");
var router = express.Router();
const db = require("../admin").db;
const admin = require("../admin").admin;

router.post("/addwishlist", auth, function (req, res) {
  console.log(req.body.uid);
  var userwishlistRef = db.collection("users").doc(req.body.uid);
  userwishlistRef
    .update({
      wishlist: admin.firestore.FieldValue.arrayUnion(req.body.productId),
    })
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/wishlist/remove", auth, (req, res) => {
  console.log(req.body);
  var userwishlistRef = db.collection("users").doc(req.body.uid);
  userwishlistRef
    .update({
      wishlist: admin.firestore.FieldValue.arrayRemove(req.body.productId),
    })
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/getwishlist", auth, (req, res) => {
  console.log(req.body.uid);
  var userwishlistRef = db.collection("users").doc(req.body.uid);
  userwishlistRef
    .get()
    .then((snapshot) => {
      const resp = snapshot.data();
      console.log(resp.wishlist);
      res.send(resp.wishlist);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/gettshirt", async function (req, res) {
  console.log(req.body.item);
  const snapshot = await db
    .collection("t-shirt")
    .doc(req.body.item)
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

router.get("/getAlltshirt", async function (req, res) {
  const snapshot = await db
    .collection("t-shirt")
    .get()
    .then((snapshot) => {
      const resp = [];
      if (snapshot.docs) {
        snapshot.forEach((doc) => {
          resp.push({ id: doc.id, ...doc.data() });
        });
        console.log(resp);
        res.send(resp);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "server error" });
    });
});

router.post("/cart/update", auth, (req, res) => {
  console.log(req.body);
  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList")
    .doc(req.body.cartid);
  userCartRef
    .set(
      {
        quantity: req.body.quantity,
      },
      { merge: true }
    )
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/cart/add", auth, (req, res) => {
  console.log(req.body);
  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList");
  userCartRef
    .add(req.body.product)
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/cart/all", auth, (req, res) => {
  console.log(req.body);

  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList");
  userCartRef
    .get()
    .then((snapshot) => {
      var cartData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { cartid: doc.id, ...data };
      });
      console.log(cartData);
      res.status(200).json(cartData);
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

router.post("/cart/remove", auth, (req, res) => {
  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList")
    .doc(req.body.productId);
  userCartRef.get().then((product) => {
    if (!product.exists) {
      res.status(200).json({
        message: "Address doesn't Exist",
      });
    } else {
      userCartRef.delete().then(() => {
        res
          .status(200)
          .json({ message: "Success" })
          .catch(() => {
            res.status(500).json({ message: "Server Error" });
          });
      });
    }
  });
});

module.exports = router;
