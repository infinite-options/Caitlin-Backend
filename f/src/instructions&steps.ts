const functions = require('firebase-functions');

exports.loadInstructionsAndSteps = functions.https.onRequest(async (req, res) => {
  const userId = req.get('userId').toString()
  const routineId = req.get('routineId').toString()
  const taskId = req.get('taskId').toString()
  const stepTitle = req.get('stepTitle').toString()
  const photo = req.get('photo').toString()
  var notifiesTa = (req.get('notifiesTa').toString() === 'true')
  var taNotificationReasons = notifiesTa ? ['overtime','start','end'] : []
  var remindsUser = (req.get('remindsUser').toString() === 'true')
  var remindTypes = remindsUser ? ['push', 'text'] : []


  let taskDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
  let getTaskDoc = taskDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        var instructionsAndSteps = doc.data();
        let item =
        {
          'title':  stepTitle,
          'audio': '',
          'available_end_time': '23:59:59',
          'available_start_time': '00:00:00',
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': true,
          'is_complete': false,
          'is_timed': true,
          'notifies_ta': notifiesTa,
          'photo': photo,
          'remind_types': remindTypes,
          'reminds_user': remindsUser,
          'status': 'Planned',
          'ta_notification_reasons': taNotificationReasons,
          'tags': ['morning', 'preparation']
        }

        instructionsAndSteps['instructions&steps'].push(item)
        taskDoc.set(instructionsAndSteps)

      }
      return doc.data();
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
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
