var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");
const db = require("../admin").db;

router.post("/getAll", (req, res) => {
  const promoRef = db.collection("promocodes");
  promoRef
    .get()
    .then((snapshot) => {
      var promoData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return data;
      });

      console.log(promoData);
      res.status(200).json(promoData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: true,
      });
    });
});

const checkCategory1 = async (uid) => {};

const checkCategory2 = async (uid, promocode) => {
  try {
    //    collection (promocodeuser) --> doc (promocode) --> collection (user) --> doc(uid)
    const promocodeUserRef = db
      .collection("promocode-users")
      .doc(promocode)
      .collection("users")
      .doc(uid);
    const availedUser = await promocodeUserRef.get();

    if (availedUser.exists) {
      // Promocode used by user
      return false;
    } else {
      // Promocode not used by user
      return true;
    }
  } catch (error) {
    return error;
  }
};

const availCategory2 = async (promocode, uid) => {
  try {
    //    collection (promocodeuser) --> doc (promocode) --> collection (user) --> doc(uid)
    const promocodeUserRef = db
      .collection("promocode-users")
      .doc(promocode)
      .collection("users")
      .doc(uid);
    const availedUser = await promocodeUserRef.get();

    if (availedUser.exists) {
      // Promocode used by user
      return false;
    } else {
      // Promocode not used by user
      await promocodeUserRef.set({
        availed: true,
      });
      return true;
    }
  } catch (error) {
    return error;
  }
};

router.post("/check-promocode", auth, async (req, res) => {
  try {
    const { promocode, uid } = req.body;
    if (promocode == undefined) {
      res.status(200).json({
        error: true,
        message: "Promocode field missing",
      });
      return;
    }

    const promocodeRef = db.collection("promocodes").doc(promocode);
    const promocodeDoc = await promocodeRef.get();
    if (!promocodeDoc.exists) {
      // in code check if discount variable exists if not then that
      // promocode was not fetched
      res.status(200).json({
        error: true,
        message: "Promocode Not found",
      });
      return;
    } else {
      // promocode exists check for its type 1 or 2
      console.log("Category:  " + promocodeDoc.data().Category);
      const category = promocodeDoc.data().Category;
      let availPromo;
      switch (category) {
        case 1:
          // unlimited promocode
          //   await checkCategory1(uid);
          availPromo = true;
          break;
        case 2:
          // one user could use only once
          availPromo = await checkCategory2(uid, promocode);
          break;

        default:
          break;
      }

      if (availPromo != true && availPromo != false) {
        //   availPromo is an error
        res.status(500).json({
          error: true,
          message: availPromo.message,
        });
        return;
      }

      if (availPromo) {
        res.status(200).json({
          error: false,
          message: "Promocode available",
          promocode: promocodeDoc.data(),
        });
      } else {
        res.status(200).json({
          error: true,
          message: "Promocode availed or Promocode not available",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.post("/get-promocode-details", auth, async (req, res) => {
  try {
    const promocode = req.body.promocode;
    if (promocode == undefined) {
      res.status(200).json({
        error: true,
        message: "Promocode not supplied",
      });
      return;
    }

    const promocodeRef = db.collection("promocodes").doc(promocode);
    const promocodeDoc = await promocodeRef.get();

    if (!promocodeDoc.exists) {
      res.status(200).json({
        error: true,
        message: "Promocode doesn't exists",
      });
      return;
    }

    res.status(200).json({
      error: false,
      message: "Promocode found",
      promocode: promocodeDoc.data(),
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

router.post("/avail-promocode", auth, async (req, res) => {
  try {
    const { promocode, uid } = req.body;
    if (promocode == undefined) {
      res.status(200).json({
        error: true,
        message: "Promocode field missing",
      });
      return;
    }

    const promocodeRef = db.collection("promocodes").doc(promocode);
    const promocodeDoc = await promocodeRef.get();
    if (!promocodeDoc.exists) {
      res.status(200).json({
        error: true,
        message: "Promocode doesn't exists",
      });
      return;
    }

    const category = promocodeDoc.data().Category;
    let availed;
    switch (category) {
      case 1:
        res.status(200).json({
          error: false,
          message: "Promocode availed",
        });
        return;
      case 2:
        availed = await availCategory2(promocode, uid);
        break;

      default:
        break;
    }

    if (availed != true && availed != false) {
      res.status(500).json({
        error: true,
        message: availed.message,
      });
      return;
    }

    if (availed) {
      res.status(200).json({
        error: false,
        message: "Promocode availed",
      });
    } else {
      res.status(200).json({
        error: true,
        message: "Promocode used or unavailable",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;
