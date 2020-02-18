const functions = require('firebase-functions');

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.SetUserInfo = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const UserId = req.get('UserId').toString()
  const UserFirstName = req.get('UserFirstName').toString()
  const UserLastName = req.get('UserLastName').toString()

  let data = {
    first_name: UserFirstName,
    last_name: UserLastName
    }
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  let snapshot = db.collection('users').doc(UserId).set(data)
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, "success");
});
