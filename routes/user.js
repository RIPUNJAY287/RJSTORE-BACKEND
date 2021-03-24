var express = require("express");
var router = express.Router();
const db = require("../admin").db;
const admin = require("../admin").admin;
const auth = require("../middlewares/auth");

router.post("/new", auth, (req, res) => {
  console.log(req.body);
  var newUserRef = db.collection("users").doc(req.body.uid);
  newUserRef
    .set({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      orders: [],
      wishlist: [],
    })
    .then(() => {
      console.log("user added");
      res.status(200).json({
        message: "Success",
      });
    })
    .catch((error) => {
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/getDetails", auth, (req, res) => {
  console.log(req.body);
  var newUserRef = db.collection("users").doc(req.body.uid);
  newUserRef
    .get()
    .then((snapshot) => {
      const resp = snapshot.data();
      res.send(resp);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "server error" });
    });
});

router.post("/address/add", auth, (req, res) => {
  console.log(req.body);
  var userAddressRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("addressList");
  userAddressRef
    .add(req.body.address)
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/address/get", auth, (req, res) => {
  console.log(req.body);
  var useraddressRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("addressList");
  useraddressRef
    .get()
    .then((snapshot) => {
      addressData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      res.status(200).json(addressData);
    })
    .catch(() => {
      res.status(500).json({ message: "Server Error" });
    });
});

router.post("/address/remove", auth, (req, res) => {
  var userAddressRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("addressList")
    .doc(req.body.addressId);
  userAddressRef.get().then((address) => {
    if (!address.exists) {
      res.status(200).json({
        message: "Address doesn't Exist",
      });
    } else {
      userAddressRef.delete().then(() => {
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

router.post("/address/edit", auth, (req, res) => {
  var userAddressRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("addressList")
    .doc(req.body.addressId);
  userAddressRef.get().then((address) => {
    if (!address.exists) {
      res.status(200).json({
        message: "Address doesn't Exist",
      });
    } else {
      userAddressRef.set(req.body.address).then(() => {
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

router.post("/add-orderId", (req, res) => {
  console.log(req.body);
  var userorderRef = db.collection("users").doc(req.body.uid);
  userorderRef
    .update({
      orders: admin.firestore.FieldValue.arrayUnion(req.body.orderId),
    })
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/cart/delete", auth, (req, res) => {
  console.log(req.body);
  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList");
  //Check in Cart
  userCartRef
    .get()
    .then((snapshot) => {
      cartData = snapshot.docs.map(async (doc) => {
        await doc.ref.delete();
      });
      res.status(200).json({ message: "success" });
    })
    .catch(() => {
      res.status(500).json({ error: "Server Error" });
    });
});

module.exports = router;
