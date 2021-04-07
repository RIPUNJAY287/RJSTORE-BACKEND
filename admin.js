const admin = require("firebase-admin");

const serviceAccount = require("./config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://food-dude-2020-default-rtdb.firebaseio.com",
  storageBucket: "gs://dude-436cc.appspot.com",
});

const db = admin.firestore();
const storage = admin.storage();
module.exports = {
  admin,
  db,
  storage,
};
