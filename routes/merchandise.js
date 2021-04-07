var express = require("express");
const auth = require("../middlewares/auth");
var router = express.Router();
const db = require("../admin").db;
var multer = require("multer");
var upload = multer();
const admin = require("../admin").admin;
const storage = require("../admin").storage;

router.post("/addwishlist", auth, function (req, res) {
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
  var userwishlistRef = db.collection("users").doc(req.body.uid);
  userwishlistRef
    .get()
    .then((snapshot) => {
      const resp = snapshot.data();

      res.send(resp.wishlist);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/gettshirt", async function (req, res) {
  const snapshot = await db
    .collection("t-shirt")
    .doc(req.body.item)
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

router.post("/cart/delete", auth, (req, res) => {
  var userCartRef = db
    .collection("users")
    .doc(req.body.uid)
    .collection("cartList");
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
router.post("/Tshirt/add", (req, res) => {
  var userTshirtRef = db.collection("t-shirt");
  userTshirtRef
    .add(req.body)
    .then((snapshot) => {
      res.status(200).json({ success: true, id: snapshot.id });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});
router.post("/Tshirt/delete", (req, res) => {
  var userTshirtRef = db.collection("t-shirt").doc(req.body.id);
  console.log(req.body.id);
  userTshirtRef
    .delete()
    .then((snapshot) => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    });
});

router.post("/add/image", upload.single("Tshirt"), async (req, res) => {
  // upload req.file.dish to firestorage and return the download url
  try {
    const file = req.file;
    const body = req.body;
    console.log(file);
    const metadata = {
      contentType: file.mimetype,
    };

    const bucketFile = storage
      .bucket()
      .file(`${body.path}/${file.originalname}`);

    await bucketFile.save(file.buffer, {
      metadata,
    });

    const [url] = await bucketFile.getSignedUrl({
      action: "read",
      expires: "01-01-2050",
    });

    res.json({ success: true, message: url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

router.post("/delete/image", async (req, res) => {
  if (req.body.token === "FoodDude") {
    try {
      const { path } = req.body;
      const data = await storage.bucket().deleteFiles({
        prefix: path,
      });
      console.log(data);
      res.json({ success: true, message: "Image deleted" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  } else {
    res.json({ success: false, message: "Invalid Request" });
  }
});

module.exports = router;
