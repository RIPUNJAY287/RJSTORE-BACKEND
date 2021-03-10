var httpError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();

var merchandise = require("./routes/merchandise");
var user = require("./routes/user");
var payment = require("./routes/payment");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use("/api/merchandise", merchandise);
app.use("/api/user", user);
app.use("/api/payment", payment);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(httpError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({ message: "Server Error" });
});
module.exports = app;
