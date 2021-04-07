var express = require("express");
var router = express.Router();
const db = require("../admin").db;

router.post("/check", async (req, res) => {
  const pinCode = req.body.pincode;

  const pincodeRef = db.collection("pincode").doc(pinCode);
  const pincodeDoc = await pincodeRef.get();
  console.log(pincodeDoc.exists);
  if (!pincodeDoc.exists) {
    // in code check if discount variable exists if not then that
    // pincode was not fetched
    res.status(200).json({
      success: false,
      message: "Pincode Not Available",
    });
    return;
  } else {
    res.status(200).json({
      message: "Pincode Available",
      success: true,
    });
  }
});
router.get("/get", async (req, res) => {
  const pincodeRef = db.collection("pincode");
  pincodeRef
    .get()
    .then((snapshot) => {
      const pincodeData = snapshot.docs.map((doc) => {
        const data = doc.id;
        return data;
      });
      console.log(pincodeData);
      res.status(200).json(pincodeData);
    })
    .catch((err) => {
      res.status(500).json({ success: false });
    });
});
router.post("/delete", async (req, res) => {
  console.log(req.body);
  const pincodeRef = db.collection("pincode").doc(req.body.pincode);
  pincodeRef
    .delete()
    .then((snapshot) => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      res.status(500).json({ success: false });
    });
});
router.post("/add", async (req, res) => {
  console.log(req.body.Pincode);
  const pincodeRef = db.collection("pincode").doc(req.body.Pincode);
  pincodeRef
    .set({ available: true })
    .then((snapshot) => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      res.status(500).json({ success: false });
    });
});
module.exports = router;
