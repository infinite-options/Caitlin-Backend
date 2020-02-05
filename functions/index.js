const admin = require('firebase-admin');
const functions = require('firebase-functions');

let serviceAccount = require('./ServiceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();

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

exports.CompleteTaskStep = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const userId = req.get('userId').toString()
  const routineId = req.get('routineId').toString()
  const taskId = req.get('taskId').toString()
  const stepNumber = parseInt(req.get('stepNumber'))

  let task = db.collection('users').doc(userId).collection('routines').doc(routineId).collection('tasks').doc(taskId);
  let getTaskDoc = task.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var steps = doc.data();
        steps.steps[stepNumber].status = 'Complete'

        let setStepComplete = task.set(steps);
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  // let user = db.collection('user').doc(userId);
  // let getUserDoc = user.get()
  //   .then(doc => {
  //     if (!doc.exists) {
  //       console.log('No such document!');
  //     } else {
  //       var userFields = doc.data();
  //       routineId = userFields.routine_ids['Get Ready']
  //     }
  //     return routineId;
  //   })
  //   .catch(err => {
  //     console.log('Error getting document', err);
  //   });
  //
  // let routine = user.collection('Routines').doc('YuLBjqCty4aHNA29f8f0')
  // let getRoutineDoc = routine.get()
  //   .then(doc => {
  //     if (!doc.exists) {
  //       console.log('No such document!');
  //     } else {
  //       var routineFields = doc.data();
  //       taskId = userFields.task_ids['Brush Teeth']
  //     }
  //     return;
  //   })
  //   .catch(err => {
  //     console.log('Error getting document', err);
  //   });
  //
  // let task = routine.collection('tasks').doc('elmSynKLyGpU9XxhE8Vp')
  // let getTaskDoc = task.get()
  //   .then(doc => {
  //     if (!doc.exists) {
  //       console.log('No such document!');
  //     } else {
  //       var steps = doc.data();
  //       steps[stepNumber].status = 'Complete'
  //       console.log('steps: ', steps);
  //
  //       let setStepComplete = task.set(steps);
  //     }
  //     return;
  //   })
  //   .catch(err => {
  //     console.log('Error getting document', err);
  //   });
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, "success");
});

exports.copyRoutineDoc = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()
  const routineId2 = req.get('routineId2').toString()

  var docData

  let doc1 = db.collection('users').doc(userId).collection('routines').doc(routineId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        docData = doc.data()
        console.log('docData: ' + docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

  let doc2 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId2)
  let getDoc2 = doc2.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        doc2.set(docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.copyTaskDoc = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()
  const routineId2 = req.get('routineId2').toString()
  const taskId1 = req.get('taskId1').toString()
  const taskId2 = req.get('taskId2').toString()

  var docData

  let doc1 = db.collection('users').doc(userId).collection('routines').doc(routineId1).collection('tasks').doc(taskId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        docData = doc.data()
        console.log('docData: ' + docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

  let doc2 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId2).collection('actions&tasks').doc(taskId2)
  let getDoc2 = doc2.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        doc2.set(docData)
      }
      return docData;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.renameTasksArray = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()

  let doc1 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var tasks = doc.data();
        let newNameData =
        {
          'actions&tasks': tasks.tasks
        }

        doc1.set(newNameData)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.loadGoalsAndRoutines = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId = req.get('routineId').toString()
  const routineTitle = req.get('routineTitle').toString()
  const category = req.get('category').toString()
  var is_persistent = (category === 'Routine') ? true : false
  const photo = req.get('photo').toString()


  let userDoc = db.collection('users').doc(userId)
  let getUserDoc = userDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var goalsAndRoutines = doc.data();
        let item =
        {
          'id':  routineId,
          'title':  routineTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'category': category,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_persistent': is_persistent,
          'is_timed': true,
          'notifies_ta': true,
          'photo': photo,
          'remind_types': ['push', 'text'],
          'reminds_user': true,
          'ta_notification_reasons': ['overtime','start','end'],
          'tags': ['morning', 'preparation']
        }

        goalsAndRoutines['goals&routines'].push(item)
        userDoc.set(goalsAndRoutines)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.loadActionsAndtasks = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId = req.get('routineId').toString()
  const taskId = req.get('taskId').toString()
  const taskTitle = req.get('taskTitle').toString()
  const photo = req.get('photo').toString()


  let routineDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
  let getRoutineDoc = routineDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var actionsAndtasks = doc.data();
        let item =
        {
          'id':  taskId,
          'title':  taskTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_timed': true,
          'notifies_ta': true,
          'photo': photo,
          'remind_types': ['push', 'text'],
          'reminds_user': true,
          'ta_notification_reasons': ['overtime','start','end'],
          'tags': ['morning', 'preparation']
        }

        actionsAndtasks['actions&tasks'].push(item)
        routineDoc.set(actionsAndtasks)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});

exports.renameStepsArray = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId1 = req.get('routineId1').toString()
  const taskId1 = req.get('taskId1').toString()

  let doc1 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId1).collection('actions&tasks').doc(taskId1)
  let getDoc1 = doc1.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var steps = doc.data();
        let newNameData =
        {
          'instructions&steps': steps.steps
        }
        doc1.set(newNameData)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    res.redirect(303, "success");
});
