import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const serviceAccount = require('../ServiceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export const loadGoalOrRoutine = functions.https.onRequest((request, response) => {
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const routineTitle = request.get('routineTitle')?.toString()
  const is_persistent = (request.get('routineTitle')?.toString() === 'true'
    || request.get('routineTitle')?.toString() === 'True') ? true : false
  const photo = request.get('photo')?.toString()
  const notes = request.get('notes')?.toString()
  const necessaryToComplete = request.get('necessaryToComplete')?.toString()
  const isAvailable = (request.get('isAvailable')?.toString() === 'true')
  const availableStartTime = request.get('availableStartTime')?.toString()
  const availableEndTime = request.get('availableEndTime')?.toString()

    if (userId && routineId && routineTitle && photo && notes && is_persistent && isAvailable && availableStartTime && availableEndTime) {
    const userDoc = db.collection('users').doc(userId)
    userDoc.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          const goalsAndRoutines = doc.data();
          const item =
          {
            'id':  routineId,
            'title':  routineTitle,
            'audio': '',
            'available_end_time': '23:59:59',
            'available_start_time': '00:00:00',
            'datetime_completed': '2020/02/03T08:32:42',
            'datetime_started': '2020/02/03T07:16:32',
            'is_available': true,
            'is_complete': false,
            'is_persistent': is_persistent,
            'is_timed': true,
            'necessary_to_complete': necessaryToComplete,
            'notes': notes,
            'notifies_ta': true,
            'photo': photo,
            'remind_types': ['push', 'text'],
            'reminds_user': true,
            'ta_notification_reasons': ['overtime','start','end'],
            'tags': ['morning', 'preparation']
          }

          if (goalsAndRoutines) {
            // check if the goals&routines array exists
            if(!goalsAndRoutines['goals&routines']) {
              goalsAndRoutines.push({'goals&routines': []})
            }
            goalsAndRoutines['goals&routines'].push(item)
            userDoc.set(goalsAndRoutines).then().catch()
          }
        }
        return doc.data();
      })
      .catch(err => {
        console.log('Error getting document', err);
      })
    response.redirect(303, "success");
  } else {
    response.redirect(400, "Bad Request: Missing request headers.");
  }
});

// export const copyRoutineDoc = functions.https.onRequest((request, response) => {
//   const userId = request.get('userId')?.toString()
//   const routineId1 = request.get('routineId1')?.toString()
//   const routineId2 = request.get('routineId2')?.toString()
//
//   var docData: { [id: string] : IPerson; } = {};
//
//   if (userId && routineId1 && routineId2) {
//     const doc1 = db.collection('users').doc(userId).collection('routines').doc(routineId1)
//     doc1.get()
//       .then(doc => {
//         if (!doc.exists) {
//           console.log('No such document!');
//         } else {
//           docData = doc.data()
//           console.log('docData: ' + docData)
//         }
//         return docData;
//       })
//       .catch(err => {
//         console.log('Error getting document', err);
//       });
//
//     const doc2 = db.collection('users').doc(userId).collection('goals&routines').doc(routineId2)
//     doc2.get()
//       .then(doc => {
//         if (!doc.exists) {
//           console.log('No such document!');
//         } else {
//           doc2.set(docData).then().catch()
//         }
//         return docData;
//       })
//       .catch(err => {
//         console.log('Error getting document', err);
//       });
//     }
//     response.redirect(303, "success");
// });

export const loadActionOrTask = functions.https.onRequest((request, response) => {
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const taskTitle = request.get('taskTitle')?.toString()
  const photo = request.get('photo')?.toString()
  const notes = request.get('notes')?.toString()
  const isAvailable = (request.get('isAvailable')?.toString() === 'true')
  const availableStartTime = request.get('availableStartTime')?.toString()
  const availableEndTime = request.get('availableEndTime')?.toString()

  if (userId && routineId && taskId && taskTitle && photo && notes && isAvailable && availableStartTime && availableEndTime) {
    const routineDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
    routineDoc.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          const actionsAndtasks = doc.data();
          const item =
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
            'notes': notes,
            'notifies_ta': true,
            'photo': photo,
            'remind_types': ['push', 'text'],
            'reminds_user': true,
            'ta_notification_reasons': ['overtime','start','end'],
            'tags': ['morning', 'preparation']
          }

          if (actionsAndtasks) {
            // check if the goals&routines array exists
            if(!actionsAndtasks['actions&tasks']) {
              actionsAndtasks.push({'actions&tasks': []})
            }
            actionsAndtasks['actions&tasks'].push(item)
            routineDoc.set(actionsAndtasks).then().catch()
          }
        }
        return doc.data();
      })
      .catch(err => {
        console.log('Error getting document', err);
      });
    }
    response.redirect(303, "success");
});

export const loadInstructionOrStep = functions.https.onRequest((request, response) => {
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const stepTitle = request.get('stepTitle')?.toString()
  const photo = request.get('photo')?.toString()
  const notes = request.get('notes')?.toString()
  const notifiesTa = (request.get('notifiesTa')?.toString() === 'true')
  const isAvailable = (request.get('isAvailable')?.toString() === 'true')
  const availableStartTime = request.get('availableStartTime')?.toString()
  const availableEndTime = request.get('availableEndTime')?.toString()

  const taNotificationReasons = notifiesTa ? ['overtime','start','end'] : []
  const remindsUser = (request.get('remindsUser')?.toString() === 'true')
  const remindTypes = remindsUser ? ['push', 'text'] : []

  if (userId && routineId && taskId && stepTitle && photo && notes && notifiesTa && isAvailable && availableStartTime && availableEndTime) {
    const taskDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
    taskDoc.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          const instructionsAndSteps = doc.data();
          const item =
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
            'notes': notes,
            'notifies_ta': notifiesTa,
            'photo': photo,
            'remind_types': remindTypes,
            'reminds_user': remindsUser,
            'status': 'Planned',
            'ta_notification_reasons': taNotificationReasons,
            'tags': ['morning', 'preparation']
          }

          if (instructionsAndSteps) {
            // check if the goals&routines array exists
            if(!instructionsAndSteps['instructions&steps']) {
              instructionsAndSteps.push({'instructions&steps': []})
            }
            instructionsAndSteps['instructions&steps'].push(item)
            taskDoc.set(instructionsAndSteps).then().catch()
          }
        }
        return doc.data();
      })
      .catch(err => {
        console.log('Error getting document', err);
      });
    }
    response.redirect(303, "success");
});

export const CompleteTaskStep = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const stepNumberReq = request.get('stepNumber')?.toString()
  let stepNumber: number


  if (userId && routineId && taskId && stepNumberReq) {
    const task = db.collection('users').doc(userId).collection('routines').doc(routineId).collection('tasks').doc(taskId);
    task.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
        } else {
          stepNumber = parseInt(stepNumberReq)
          let steps = doc.data();
          if (steps && steps.steps[stepNumber]) {
            steps.steps[stepNumber].is_complete = true;

            if (!steps.steps[stepNumber].datetime_completed) {
              steps.steps[stepNumber].push('datetime_completed')
            }

            steps.steps[stepNumber].datetime_completed = getCurrentDateTime()

            task.set(steps).then().catch();
          }
        }
        return routineId;
      })
      .catch(err => {
        console.log('Error getting document', err);
      });
  }
  response.redirect(303, "success");
});

function getCurrentDateTime() {
  const today = new Date()

  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const hh = String(today.getHours()).padStart(2, '0')
  const mn = String(today.getMinutes()).padStart(2, '0')
  const ss = String(today.getSeconds()).padStart(2, '0')

  return yyyy + '/' + mm + '/' + dd + 'T' + hh + ':' + mn + ':' + ss
}
