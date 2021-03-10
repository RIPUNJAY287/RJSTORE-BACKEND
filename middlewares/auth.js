const admin = require("../admin").admin;
module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      if (req.body.uid != uid) {
        res.status(401).json({ error: "Unauthorized" });
      } else {
        next();
      }
    })
    .catch((error) => {
      res.status(401).json({ error: "Unauthorized" });
    });
};
