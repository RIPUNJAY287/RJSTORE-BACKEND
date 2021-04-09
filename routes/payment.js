var express = require("express");
const auth = require("../middlewares/auth");
var router = express.Router();
const db = require("../admin").db;
const admin = require("../admin").admin;

const Razorpay = require("razorpay");
const { customAlphabet } = require("nanoid");
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-";

var razorpay = new Razorpay({
  key_id: "rzp_test_EiZSxsNLqYV1IM",
  key_secret: "vdYsJfYI72MaU0o8jJwhPIXy",
});

router.post("/razorpay", auth, async (req, res) => {
  const payment_capture = 1;
  const amount = req.body.price;
  const currency = "INR";
  const type = req.body.type;

  if (amount == undefined || type == undefined) {
    res.status(400).json({
      error: true,
      message: "Missing some parameters",
    });
    return;
  }

  try {
    if (req.body.type === 0) {
      // cash payment
      const nanoid = customAlphabet(alphabet, 21);
      const order_id = "order_" + nanoid();
      res.status(200).json({
        error: false,
        message: order_id,
      });
    } else if (req.body.type === 1) {
      console.log("online payment");
      // online payment
      const amount = req.body.price;
      const options = {
        amount: amount * 100,
        currency,
        payment_capture,
      };
      const response = await razorpay.orders.create(options);
      console.log(response);
      res.status(200).json({
        error: false,
        message: response.id,
        id: response.id,
        currency: response.currency,
        amount: response.amount / 100,
      });
    } else {
      res.status(400).json({
        error: true,
        message: "type value missing",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

module.exports = router;
