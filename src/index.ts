import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const firebase_tools = require('firebase-tools');
//const serviceAccount = require('../ServiceAccount.json');
//const serviceAccount = require('../ServiceAccountMyLife.json');
const serviceAccount = require('../ServiceAccountKey.json');

const fs = require( 'fs' );
const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2
var credentials_url = 'credentials.json';
const redirect_uri = "https://developers.google.com/oauthplayground";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export const UpdateTitleFilter = functions.https.onRequest(async (request, response) => {

  let gratisPaths: string[] = []
  const gratisStrings: string[] = ['goals&routines', 'actions&tasks', 'instructions&steps']
  const docIdTitles = Object()

  gratisPaths.push('users')

  for (const gratisString of gratisStrings) {
    const nextCollections: string[] = []
    for (const gratisPath of gratisPaths) {
      await db.collection(gratisPath).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data()
          if (doc.id in docIdTitles) {
            data['title'] = docIdTitles[doc.id]
            db.doc(doc.ref.path).set(data).then().catch();
          }
          if (gratisString != 'instructions&steps') {
            nextCollections.push(doc.ref.path + '/' + gratisString)
            for (const gratisData of data[gratisString]) {
              docIdTitles[gratisData['id'].toString()] = gratisData['title']
            }
          }
        });
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
    }
    gratisPaths = nextCollections
  }
  response.redirect(303, 'success');
});

export const AddGoalOrRoutine = functions.https.onRequest((request, response) => {
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
          'available_end_time': availableEndTime,
          'available_start_time': availableStartTime,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': isAvailable,
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
    response.redirect(303, 'success');
  } else {
    response.redirect(400, 'Bad Request: Missing request headers.');
  }
});

export const AddActionOrTask = functions.https.onRequest((request, response) => {
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
          'available_end_time': availableEndTime,
          'available_start_time': availableStartTime,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': isAvailable,
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
  response.redirect(303, 'success');
});

export const AddInstructionOrStep = functions.https.onRequest((request, response) => {
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
          'available_end_time': availableEndTime,
          'available_start_time': availableStartTime,
          'datetime_completed': '2020/02/03T08:32:42',
          'datetime_started': '2020/02/03T07:16:32',
          'is_available': isAvailable,
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
            instructionsAndSteps['instructions&steps'] = []
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
  response.redirect(303, 'success');
});

export const StartTaskStep = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const stepNumberReq = request.get('stepNumber')?.toString()
  let stepNumber: number

  if (userId && routineId && taskId && stepNumberReq) {
    const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);
    task.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      }
      else {
        stepNumber = parseInt(stepNumberReq)
        const steps = doc.data()!;
        steps['instructions&steps'][stepNumber].datetime_started = getCurrentDateTimeUTC()
        task.set(steps).then().catch();
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});

/*
export const StartGoalOrRoutine = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const routineNumberReq = request.get('routineNumber')?.toString()
  let routineNumber: number

  if (userId && routineId && routineNumberReq) {
    const user = db.collection('users').doc(userId)
    user.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        routineNumber = parseInt(routineNumberReq)
        const routines = doc.data()!;
        // console.log('Document data:', doc.data());

        if (routines['goals&routines'][routineNumber].id === routineId) {
          routines['goals&routines'][routineNumber].is_in_progress = true;
          routines['goals&routines'][routineNumber].is_complete = false;
          routines['goals&routines'][routineNumber].datetime_started = getCurrentDateTimeUTC()
          user.set(routines).then().catch();
        } else {
          for (let i: number = 0; i < routines['goals&routines'].length; i++) {
            if (routines['goals&routines'][i].id === routineId) {
              routines['goals&routines'][i].is_in_progress = true;
              routines['goals&routines'][i].is_complete = false;
              routines['goals&routines'][i].datetime_started = getCurrentDateTimeUTC()
              user.set(routines).then().catch();
            }
          }
        }
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

exports.StartGoalOrRoutine = functions.https.onCall(async (data, context) => {

    //Grab the text parameter.
    const userId = data.userId?.toString();
    const routineId = data.routineId?.toString();
    const routineNumberReq = data.taskNumber?.toString();
    let routineNumber;

    if (userId && routineId && routineNumberReq) {
        const user = db.collection('users').doc(userId);

        //Using a promise here since 'onCall' is async.
        return user.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    return 404;
                }
                else {
                    routineNumber = parseInt(routineNumberReq);
                    const routines = doc.data()!;
                    // console.log('Document data:', doc.data());
                    if (routines['goals&routines'].length>routineNumber && routines['goals&routines'][routineNumber].id === routineId) {
                        routines['goals&routines'][routineNumber].is_in_progress = true;
                        routines['goals&routines'][routineNumber].is_complete = false;
                        routines['goals&routines'][routineNumber].datetime_started = getCurrentDateTimeUTC();
                        user.set(routines).then().catch();
                        console.log('Success');
                        return 200;
                    }
                    else {
                        for (let i = 0; i < routines['goals&routines'].length; i++) {
                            if (routines['goals&routines'][i].id === routineId) {
                                routines['goals&routines'][i].is_in_progress = true;
                                routines['goals&routines'][i].datetime_started = getCurrentDateTimeUTC();
                                user.set(routines).then().catch();
                                console.log('Success');
                                return 200;
                            }
                        }
                    }
                  return 404;
                }
            })
            .catch(err => {
            console.log('Error getting document', err);
            return 400;
        });
    }
    else{
      return 400;
    }
});

/*
export const StartActionOrTask = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const taskNumberReq = request.get('taskNumber')?.toString()
  let taskNumber: number

  if (userId && routineId && taskId && taskNumberReq) {
    const routine = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
    routine.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        taskNumber = parseInt(taskNumberReq)
        const tasks = doc.data()!;
        // console.log('Document data:', doc.data());

        if (tasks['actions&tasks'][taskNumber].id === taskId) {
          tasks['actions&tasks'][taskNumber].is_in_progress = true;
          tasks['actions&tasks'][taskNumber].is_complete = true;
          tasks['actions&tasks'][taskNumber].datetime_started = getCurrentDateTimeUTC()
          routine.set(tasks).then().catch();
        } else {
          for (let i: number = 0; i < tasks['actions&tasks'].length; i++) {
            if (tasks['actions&tasks'][i].id === taskId) {
              tasks['actions&tasks'][i].is_complete = true;
              tasks['actions&tasks'][i].is_complete = true;
              tasks['actions&tasks'][i].datetime_started = getCurrentDateTimeUTC()
              routine.set(tasks).then().catch();
            }
          }
        }
      }
      return taskId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

exports.StartActionOrTask = functions.https.onCall( async (data, context) => {

    //Grab the text parameter.
    const userId = data.userId?.toString();
    const routineId = data.routineId?.toString();
    const taskId = data.taskId?.toString();
    const taskNumberReq = data.taskNumber?.toString();
    let taskNumber;

    if (userId && routineId && taskId && taskNumberReq) {
        const routine = db.collection('users').doc(userId).collection('goals&routines').doc(routineId);

        //Using a promise here since 'onCall' is async.
        return routine.get()
          .then(doc => {
              if (!doc.exists) {
                  console.log('No such document!');
                  return 404;
              }
                else {
                    taskNumber = parseInt(taskNumberReq);
                    const tasks = doc.data()!;
                    if (tasks['actions&tasks'].length>taskNumber && tasks['actions&tasks'][taskNumber].id === taskId) {
                        tasks['actions&tasks'][taskNumber].is_in_progress = true;
                        tasks['actions&tasks'][taskNumber].is_complete = false;
                        tasks['actions&tasks'][taskNumber].datetime_started = getCurrentDateTimeUTC();
                        routine.set(tasks).then().catch();
                        console.log('Success');
                        return 200;
                    }
                    else {
                        for (let i = 0; i < tasks['actions&tasks'].length; i++) {
                            if (tasks['actions&tasks'][i].id === taskId) {
                                tasks['actions&tasks'][i].is_in_progress = true;
                                tasks['actions&tasks'][i].datetime_started = getCurrentDateTimeUTC();
                                routine.set(tasks).then().catch();
                                console.log('Success');
                                return 200;
                            }
                        }
                    }
                  return 404;
                }
            })
            .catch(err => {
            console.log('Error getting document', err);
            return 400;
        });
    }
    else{
      return 400;
    }
});

/*
export const StartInstructionOrStep = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const stepNumberReq = request.get('stepNumber')?.toString()
  let stepNumber: number

  if (userId && routineId && taskId && stepNumberReq) {
    const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);
    task.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        stepNumber = parseInt(stepNumberReq)
        const steps = doc.data()!;
        // console.log('Document data:', doc.data());

        steps['instructions&steps'][stepNumber].is_in_progress = true;
        steps['instructions&steps'][stepNumber].is_complete = true;
        steps['instructions&steps'][stepNumber].datetime_started = getCurrentDateTimeUTC()

        task.set(steps).then().catch();
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

export const StartInstructionOrStep = functions.https.onCall( async (data, context) => {

  // Grab the text parameter.
  const userId = data.userId?.toString();
  const routineId = data.routineId?.toString();
  const taskId = data.taskId?.toString();
  const stepNumberReq = data.stepNumber?.toString();
  let stepNumber;

  if (userId && routineId && taskId && stepNumberReq) {
    const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);

    //Using a promise here since 'onCall' is async.
    return task.get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such document!');
          return 404;
        }
        else {
          stepNumber = parseInt(stepNumberReq)
          const steps = doc.data()!;
          steps['instructions&steps'][stepNumber].is_in_progress = true;
          steps['instructions&steps'][stepNumber].is_complete = false;
          steps['instructions&steps'][stepNumber].datetime_started = getCurrentDateTimeUTC()
          task.set(steps).then().catch();
          console.log('Success');
          return 200;
        }
      })
      .catch(err => {
        console.log('Error getting document', err);
        return 400;
      });
  }
  else{
    return 400;
  }
});

/*
export const CompleteInstructionOrStep = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const stepNumberReq = request.get('stepNumber')?.toString()
  let stepNumber: number

  if (userId && routineId && taskId && stepNumberReq) {
    const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);
    task.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        stepNumber = parseInt(stepNumberReq)
        const steps = doc.data()!;
        // console.log('Document data:', doc.data());

        steps['instructions&steps'][stepNumber].is_in_progress = false;
        steps['instructions&steps'][stepNumber].is_complete = true;
        steps['instructions&steps'][stepNumber].datetime_completed = getCurrentDateTimeUTC()

        task.set(steps).then().catch();
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

exports.CompleteInstructionOrStep = functions.https.onCall(async (data, context) => {

    //Grab the text parameter.
    const userId = data.userId?.toString();
    const routineId = data.routineId?.toString();
    const taskId = data.taskId?.toString();
    const stepNumberReq = data.stepNumber?.toString();
    let stepNumber;

    if (userId && routineId && taskId && stepNumberReq) {
        console.log('First test passed...');
        const task = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId);

        //Using a promise here since 'onCall' is async.
        return task.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    return 404;
                }
                else {
                    stepNumber = parseInt(stepNumberReq);
                    const steps = doc.data()!;
                    steps['instructions&steps'][stepNumber].is_in_progress = false;
                    steps['instructions&steps'][stepNumber].is_complete = true;
                    steps['instructions&steps'][stepNumber].datetime_completed = getCurrentDateTimeUTC();
                    task.set(steps).then().catch();
                    console.log('Success');
                    return 200;
                }
            })
            .catch(err => {
            console.log('Error getting document', err);
            return 400;
        });
    }
    else{
      return 400;
    }
});

/*
export const CompleteActionOrTask = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()
  const taskNumberReq = request.get('taskNumber')?.toString()
  let taskNumber: number

  if (userId && routineId && taskId && taskNumberReq) {
    const routine = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
    routine.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        taskNumber = parseInt(taskNumberReq)
        const tasks = doc.data()!;
        // console.log('Document data:', doc.data());

        if (tasks['actions&tasks'][taskNumber].id === taskId) {
          tasks['actions&tasks'][taskNumber].is_in_progress = false;
          tasks['actions&tasks'][taskNumber].is_complete = true;
          tasks['actions&tasks'][taskNumber].datetime_completed = getCurrentDateTimeUTC()
          routine.set(tasks).then().catch();
        } else {
          for (let i: number = 0; i < tasks['actions&tasks'].length; i++) {
            if (tasks['actions&tasks'][i].id === taskId) {
              tasks['actions&tasks'][i].is_in_progress = false;
              tasks['actions&tasks'][i].is_complete = true;
              tasks['actions&tasks'][i].datetime_completed = getCurrentDateTimeUTC()
              routine.set(tasks).then().catch();
            }
          }
        }
      }
      return taskId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

exports.CompleteActionOrTask = functions.https.onCall( async (data, context) => {

    //Grab the text parameter.
    const userId = data.userId?.toString();
    const routineId = data.routineId?.toString();
    const taskId = data.taskId?.toString();
    const taskNumberReq = data.taskNumber?.toString();
    let taskNumber;

    if (userId && routineId && taskId && taskNumberReq) {
        const routine = db.collection('users').doc(userId).collection('goals&routines').doc(routineId);

        //Using a promise here since 'onCall' is async.
        return routine.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    return 404;
                }
                else {
                    taskNumber = parseInt(taskNumberReq);
                    const tasks = doc.data()!;
                    if (tasks['actions&tasks'].length>taskNumber && tasks['actions&tasks'][taskNumber].id === taskId) {
                        tasks['actions&tasks'][taskNumber].is_in_progress = false;
                        tasks['actions&tasks'][taskNumber].is_complete = true;
                        tasks['actions&tasks'][taskNumber].datetime_completed = getCurrentDateTimeUTC();
                        routine.set(tasks).then().catch();
                        console.log('Success');
                        return 200;
                    }
                    else {
                        console.log('Will iterate now...');
                        for (let i = 0; i < tasks['actions&tasks'].length; i++) {
                            if (tasks['actions&tasks'][i].id === taskId) {
                                tasks['actions&tasks'][i].is_in_progress = false;
                                tasks['actions&tasks'][i].is_complete = true;
                                tasks['actions&tasks'][i].datetime_completed = getCurrentDateTimeUTC();
                                routine.set(tasks).then().catch();
                                console.log('Success');
                                return 200;
                            }
                        }
                        return 404;
                    }
                }
            })
            .catch(err => {
            console.log('Error getting document', err);
            return 400;
        });
    }
    else{
      return 400;
    }
});

/*
export const CompleteGoalOrRoutine = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const routineNumberReq = request.get('routineNumber')?.toString()
  let routineNumber: number

  if (userId && routineId && routineNumberReq) {
    const user = db.collection('users').doc(userId)
    user.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        routineNumber = parseInt(routineNumberReq)
        const routines = doc.data()!;
        // console.log('Document data:', doc.data());

        if (routines['goals&routines'][routineNumber].id === routineId) {
          routines['goals&routines'][routineNumber].is_in_progress = false;
          routines['goals&routines'][routineNumber].is_complete = true;
          routines['goals&routines'][routineNumber].datetime_completed = getCurrentDateTimeUTC()
          user.set(routines).then().catch();
        } else {
          for (let i: number = 0; i < routines['goals&routines'].length; i++) {
            if (routines['goals&routines'][i].id === routineId) {
              routines['goals&routines'][i].is_in_progress = false;
              routines['goals&routines'][i].is_complete = true;
              routines['goals&routines'][i].datetime_completed = getCurrentDateTimeUTC()
              user.set(routines).then().catch();
            }
          }
        }
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});
*/

exports.CompleteGoalOrRoutine = functions.https.onCall( async (data, context) => {

    //Grab the text parameter.
    const userId = data.userId?.toString();
    const routineId = data.routineId?.toString();
    const routineNumberReq = data.routineNumber?.toString();
    let routineNumber;

    if (userId && routineId && routineNumberReq) {
        const user = db.collection('users').doc(userId);

        //Using a promise here since 'onCall' is async.
        return user.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    return 404;
                }
                else {
                    routineNumber = parseInt(routineNumberReq);
                    const routines = doc.data()!;
                    if (routines['goals&routines']>routineNumber && routines['goals&routines'][routineNumber].id === routineId) {
                        routines['goals&routines'][routineNumber].is_in_progress = false;
                        routines['goals&routines'][routineNumber].is_complete = true;
                        routines['goals&routines'][routineNumber].datetime_completed = getCurrentDateTimeUTC();
                        user.set(routines).then().catch();
                        return 200;
                    }
                    else {
                        for (let i = 0; i < routines['goals&routines'].length; i++) {
                            if (routines['goals&routines'][i].id === routineId) {
                                routines['goals&routines'][i].is_in_progress = false;
                                routines['goals&routines'][i].is_complete = true;
                                routines['goals&routines'][i].datetime_completed = getCurrentDateTimeUTC();
                                user.set(routines).then().catch();
                                console.log('Success');
                                return 200;
                            }
                        }
                        return 404;
                    }
                }
            })
            .catch(err => {
            console.log('Error getting document', err);
            return 400;
        });
    }
    else{
      return 400;
    }
});

export const GRUserNotificationSetToTrue = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const routineNumberReq = request.get('routineNumber')?.toString()
  const status = request.get('status')?.toString()
  let routineNumber: number
  const statusOptions = ['before', 'during', 'after']


  if (userId && routineId && routineNumberReq && status && status in statusOptions) {
    const user = db.collection('users').doc(userId)
    user.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        routineNumber = parseInt(routineNumberReq)
        const routines = doc.data()!;
        // console.log('Document data:', doc.data());

        if (routines['goals&routines'][routineNumber].id === routineId) {
          routines['goals&routines'][routineNumber]['user_notifications'][status]['is_set'] = true;
          routines['goals&routines'][routineNumber]['user_notifications'][status]['date_set'] = getCurrentDateTimeUTC();
          user.set(routines).then().catch();
        } else {
          for (let i: number = 0; i < routines['goals&routines'].length; i++) {
            if (routines['goals&routines'][i].id === routineId) {
              routines['goals&routines'][i]['user_notifications'][status]['is_set'] = true;
              routines['goals&routines'][i]['user_notifications'][status]['date_set'] = getCurrentDateTimeUTC();
              user.set(routines).then().catch();
            }
          }
        }
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
    response.redirect(303, 'success');
  } else {
    response.redirect(500, 'Internal Server Error');
  }
});

export const AddNotificationField = functions.https.onRequest(async (request, response) => {

  let batch = db.batch();
  const atCollections: string[] = []
  const isCollections: string[] = []

  await db.collection('users').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data()
      if (Array.isArray(data['goals&routines']) && data['goals&routines'].length) {
        for (const grItem of data['goals&routines']) {
          if (!('ta_notifications' in grItem)) {
            grItem['ta_notifications'] = {}
          }
          if (!('user_notifications' in grItem)) {
            grItem['user_notifications'] = {}
          }
          setNotificationData(grItem['ta_notifications'])
          setNotificationData(grItem['user_notifications'])
          deleteFields(grItem)
        }
        atCollections.push(doc.ref.path + '/goals&routines')
        batch.set(db.doc(doc.ref.path), data, {merge: true})
      }
    });
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });

  for (const collection of atCollections) {
    await db.collection(collection).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data()
        if (Array.isArray(data['actions&tasks']) && data['actions&tasks'].length) {
          for (const atItem of data['actions&tasks']) {
            if (!('ta_notifications' in atItem)) {
              atItem['ta_notifications'] = {}
            }
            if (!('user_notifications' in atItem)) {
              atItem['user_notifications'] = {}
            }
            setNotificationData(atItem['ta_notifications'])
            setNotificationData(atItem['user_notifications'])
            deleteFields(atItem)
          }
          isCollections.push(doc.ref.path + '/actions&tasks')
          batch.set(db.doc(doc.ref.path), data, {merge: true})
        }
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
  }

  for (const collection of isCollections) {
    await db.collection(collection).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data()
        if (Array.isArray(data['instructions&steps']) && data['instructions&steps'].length) {
          for (const isItem of data['instructions&steps']) {
            if (!('ta_notifications' in isItem)) {
              isItem['ta_notifications'] = {}
            }
            if (!('user_notifications' in isItem)) {
              isItem['user_notifications'] = {}
            }
            setNotificationData(isItem['ta_notifications'])
            setNotificationData(isItem['user_notifications'])
            deleteFields(isItem)
          }
          batch.set(db.doc(doc.ref.path), data, {merge: true})
        }
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
  }
  // Commit the batch
  return batch.commit().then(function () {
    // ...
  });

  response.redirect(303, 'success');
});

export const AddCollectionField = functions.https.onRequest(async (request, response) => {
  // Grab the text parameter.
  const collection = request.get('collection')?.toString() // 'goals&routines'
  const field = request.get('field')?.toString() // 'expected_time'
  const valueType = request.get('valueType')?.toString() // string
  const valueReq = request.get('value')?.toString() // '00:10:00'

  if (collection && field && valueType && valueReq) {
    let gratisPaths: string[] = []
    const gratisStrings: string[] = ['goals&routines', 'actions&tasks', 'instructions&steps']
    let isFieldUpdated = false

    gratisPaths.push('users')

    for (let i = 0; i < gratisStrings.length; i++) {
      console.log('gratisPaths: ' + gratisPaths)
      const nextCollections: string[] = []
      for (const gratisPath of gratisPaths) {
        await db.collection(gratisPath).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data()
            const isSpecifiedCollection = gratisStrings[i] === collection
            nextCollections.push(doc.ref.path + '/' + gratisStrings[i])

            if (isSpecifiedCollection) {
              for (const gratisData of data[gratisStrings[i]]) {
                gratisData[field] = parseValue(valueReq, valueType)
              }
              db.doc(doc.ref.path).set(data).then().catch();
              isFieldUpdated = true
            }
          });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
      }
      if (isFieldUpdated) {
        break;
      }
      gratisPaths = nextCollections
    }
    response.redirect(303, 'success');
  } else {
    response.redirect(500, 'Internal Server Error');
  }
});

export const AddDatabaseField = functions.https.onRequest(async (request, response) => {
  // Grab the text parameter.
  const field = request.get('field')?.toString() // 'expected_time'
  const valueType = request.get('valueType')?.toString() // string
  const valueReq = request.get('value')?.toString() // '00:10:00'

  if (field && valueType && valueReq) {
    let gratisPaths: string[] = []
    const gratisStrings: string[] = ['goals&routines', 'actions&tasks', 'instructions&steps']

    gratisPaths.push('users')

    for (let i = 0; i < gratisStrings.length; i++) {
      console.log('gratisPaths: ' + gratisPaths)
      const nextCollections: string[] = []
      for (const gratisPath of gratisPaths) {
        await db.collection(gratisPath).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            const data = doc.data()
            nextCollections.push(doc.ref.path + '/' + gratisStrings[i])

            for (const gratisData of data[gratisStrings[i]]) {
              gratisData[field] = parseValue(valueReq, valueType)
            }
            db.doc(doc.ref.path).set(data).then().catch();
          });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
      }
      gratisPaths = nextCollections
    }
    response.redirect(303, 'success');
  } else {
    response.redirect(500, 'Internal Server Error');
  }
});

export const ResetGratisStatus = functions.https.onRequest(async (req, res) => {
  db.collection("users").get()
  .then((snapshot) =>
  {
    snapshot.forEach(doc => {
      if (doc.data()["goals&routines"] != null) {
        let arrs = doc.data()["goals&routines"];
        arrs.forEach((gr: {
          is_in_progress: boolean,
          is_complete: boolean,
          is_set: boolean,
          datetime_completed: string,
          datetime_started: string,
          ta_notifications:   {[index: string]: {is_set: boolean}},
          user_notifications:  {[index: string]: {is_set: boolean}},
        }) => {
          gr['is_in_progress'] = false
          gr['is_complete'] = false
          gr['datetime_completed'] = "Thu, 09 Jul 2020 00:00:00 GMT";
          gr['datetime_started'] = "Thu, 09 Jul 2020 00:00:00 GMT";
          delete gr['is_set'];
          Object.keys(gr['ta_notifications'])
          .forEach( (k: string) => {
            gr['ta_notifications'][k].is_set = false
          });
          Object.keys(gr['user_notifications'])
          .forEach( (k: string) => {
            gr['user_notifications'][k].is_set = false
          });
        });
        db.collection("users")
        .doc(doc.id)
        .update({ "goals&routines": arrs });
      }
    });
    res.redirect(303, 'success');
  });
});

export const CopyDocDataToChild = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const collection = request.get('collection')?.toString()
  const userId = request.get('userId')?.toString()
  const routineId = request.get('routineId')?.toString()
  const taskId = request.get('taskId')?.toString()

  let docCopyData: FirebaseFirestore.DocumentData

  let docToCopy: FirebaseFirestore.DocumentReference
  let copyToDoc: FirebaseFirestore.DocumentReference

  if (collection && userId && routineId && taskId) {
    switch (collection) {
      case 'goals&routines':
      docToCopy = db.collection('users').doc(userId)
      copyToDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
      break;
      case 'actions&tasks':
      docToCopy = db.collection('users').doc(userId).collection('goals&routines').doc(routineId)
      copyToDoc = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
      break;
      case 'instructions&steps':
      docToCopy = db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId)
      copyToDoc= db.collection('users').doc(userId).collection('goals&routines').doc(routineId).collection('actions&tasks').doc(taskId).collection('instructions&steps').doc(taskId)
      break;
      default:
      docToCopy = db.collection('users').doc('wrongCollection')
      copyToDoc = db.collection('users').doc('wrongCollection')

    }

    docToCopy.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        docCopyData = doc.data()![collection];
        console.log('Document data:', doc.data())
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

    copyToDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        const currentData = doc.data()!;
        console.log('Document data:', doc.data());

        currentData.push(docCopyData)

        copyToDoc.set(currentData).then().catch();
      }
      return routineId;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }

  response.redirect(303, 'success');
});

export const SetUserGoogleAuthToken = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const token = request.get('token')?.toString()
  const userId = request.get('userId')?.toString()


  if (token && userId) {

    const userDoc = db.collection('users').doc(userId)
    userDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        const userFields = doc.data();

        if (userFields) {
          userFields['google_auth_token'] = token
          userDoc.set(userFields).then().catch();
        }
      }
      return userDoc;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});

export const SetUserGoogleRefreshToken = functions.https.onRequest((request, response) => {
  // Grab the text parameter.
  const token = request.get('token')?.toString()
  const userId = request.get('userId')?.toString()


  if (token && userId) {

    const userDoc = db.collection('users').doc(userId)
    userDoc.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        const userFields = doc.data();

        if (userFields) {
          userFields['google_refresh_token'] = token
          userDoc.set(userFields).then().catch();
        }
      }
      return userDoc;
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  response.redirect(303, 'success');
});

/**
* Initiate a recursive delete of documents at a given path.
*
* The calling user must be authenticated and have the custom 'admin' attribute
* set to true on the auth token.
*
* This delete is NOT an atomic operation and it's possible
* that it may fail after only deleting some documents.
*
* @param {string} data.path the document or collection path to delete.
*/
exports.RecursiveDelete = functions
.runWith({
  timeoutSeconds: 540,
  memory: '2GB'
})
.https.onCall((data, context) => {
  // Only allow admin users to execute this function.
  // if (!(context.auth && context.auth.token && context.auth.token.admin)) {
  //     throw new functions.https.HttpsError(
  //         'permission-denied',
  //         'Must be an administrative user to initiate delete.'
  //     );
  // }

  const path = data.path;
  console.log(
    `Apoorv has requested to delete path ${path}`
  );

  // Run a recursive delete on the given document or collection path.
  // The 'token' must be set in the functions config, and can be generated
  // at the command line by running 'firebase login:ci'.
  return firebase_tools.firestore
  .delete(path, {
    project: serviceAccount.project_id,
    recursive: true,
    yes: true,
    token: functions.config().fb.token
  })
  .then(() => {
    return {
      path: path
    };
  });
});

/**
find the user with email id
*/
exports.FindUserDoc = functions.https.onCall(async (data, context) => {
  // Grab the text parameter.
  let emailId = data.emailId;
  var emailId1 = emailId.toLowerCase();
  var email = emailId1.split("@");
  email[0] = email[0].split(".").join("");
  email[0] = email[0].concat("@");
  var emailId_final = email[0].concat(email[1]);
  console.log(emailId1);
  console.log(emailId_final);
  var userDetails = {id:""};
  let users = db.collection('users');
  let userData = users.where('email_id', '==', emailId_final );
  await userData.get()
  .then(snapshot => {
    if (snapshot.empty) {
      console.log('No matching documents.');
      //return "User Not Found";
    }
    snapshot.forEach(doc => {
      userDetails.id = doc.id
      console.log(userDetails);
    });
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
  return userDetails;
});

exports.LogGRHistory = functions.https.onRequest((req, res) => {
  var date = new Date(new Date().toLocaleString('en-US', {
		timeZone: "America/Los_Angeles"
	}));
  // log for previous day
  date.setDate(date.getDate()-1);
  let date_string = (((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());
  let users: any[] = []
  db.collection("users").get()
  .then((snapshot) =>
  {
    snapshot.forEach(doc => {
      var data = doc.data()['goals&routines']
      if (data != null) {
        let usr: {"email_id": string, "goals&routines": {id: string, title: string, is_complete: string}[], user_id: string} =
        {"email_id": doc.data().email_id, "goals&routines": [], user_id: doc.id}
        data.forEach((gr: {id: string, title: string, is_complete: string}) => {
          usr["goals&routines"].push(
            {
              id: gr['id'],
              title: gr['title'],
              is_complete: gr['is_complete']
            }
          )
        });
        users.push(usr)
      }
    });
    users.forEach( usr => {
      let docRef = db.collection("history").doc(usr.user_id);
			let logRef = docRef.collection("goals&routines").doc();
			docRef.set(
				{
					email_id: usr.email_id
				}
			)
			logRef.set(
				{
					date: date_string,
					log: usr["goals&routines"]
				}
			)
    });
    res.redirect(303, 'success');
  });
});

exports.UpdateGRIsDisplayed = functions.https.onRequest((req, res) => {
  let CurrentDate: Date = new Date(new Date().toLocaleString('en-US', {
    timeZone: "America/Los_Angeles"
  }));
  CurrentDate.setHours(0,0,0,0);

  db.collection("users").get()
  .then((snapshot) =>
  {
    snapshot.forEach(doc => {
      if (doc.data()["goals&routines"] != null) {
        let arrs = doc.data()["goals&routines"];
        arrs.forEach((gr: {
          start_day_and_time: string,
          repeat_occurences: string,
          is_displayed_today: boolean,
          repeat_frequency: string,
          repeat_ends: string,
          repeat_ends_on: string,
          repeat_every: string,
          repeat_week_days:  {[index: string]: string},
          repeat: boolean,
        }) => {
          let startDate = new Date(new Date(gr["start_day_and_time"]).toLocaleString('en-US', {
            timeZone: "America/Los_Angeles"
          }));
          startDate.setHours(0,0,0,0);
          let isDisplayedTodayCalculated: boolean = false;
          let repeatOccurences = parseInt(gr["repeat_occurences"]);
          let repeatEvery = parseInt(gr["repeat_every"]);
          let repeatEnds = gr["repeat_ends"];
          let repeatEndsOn: Date = new Date(new Date(gr["repeat_ends_on"]).toLocaleString('en-US', {
            timeZone: "America/Los_Angeles"
          }));
          repeatEndsOn.setHours(0,0,0,0);
          let repeatFrequency: string = gr["repeat_frequency"];
          let repeatWeekDays: number[] = [];
          if (gr["repeat_week_days"] != null) {
            Object.keys(gr["repeat_week_days"])
            .forEach( (k: string) => {
              if (gr["repeat_week_days"][k] != "") {
                repeatWeekDays.push(parseInt(k));
              }
            });
          }

          if (!gr.repeat) {
            isDisplayedTodayCalculated = CurrentDate.getTime() - startDate.getTime() == 0
          } else {
            if (CurrentDate >= startDate) {
              if (repeatEnds == "On") {
              } else if (repeatEnds == "After") {
                if (repeatFrequency == "DAY") {
                  repeatEndsOn = new Date(startDate);
                  repeatEndsOn.setDate(startDate.getDate() + (repeatOccurences-1)*repeatEvery);
                } else if (repeatFrequency == "WEEK"){
                  repeatEndsOn = new Date(startDate);
                  repeatEndsOn.setDate(startDate.getDate() + (repeatOccurences-1)*7*repeatEvery);
                } else if (repeatFrequency == "MONTH"){
                  repeatEndsOn = new Date(startDate);
                  repeatEndsOn.setMonth(startDate.getMonth() + (repeatOccurences-1)*repeatEvery);
                } else if (repeatFrequency == "YEAR"){
                  repeatEndsOn = new Date(startDate);
                  repeatEndsOn.setFullYear(startDate.getFullYear() + (repeatOccurences-1)*repeatEvery);
                }
              } else if (repeatEnds == "Never") {
                repeatEndsOn = CurrentDate;
              }

              if (CurrentDate <= repeatEndsOn) {
                if (repeatFrequency == "DAY") {
                  isDisplayedTodayCalculated = Math.floor((CurrentDate.getTime() - startDate.getTime())/(24*3600*1000)) % repeatEvery == 0;
                } else if (repeatFrequency == "WEEK"){
                  isDisplayedTodayCalculated = repeatWeekDays.includes(CurrentDate.getDay()) && Math.floor((CurrentDate.getTime() - startDate.getTime())/(7*24*3600*1000)) % repeatEvery == 0;
                } else if (repeatFrequency == "MONTH"){
                  isDisplayedTodayCalculated = (CurrentDate.getDate() == startDate.getDate()) &&
                  ((CurrentDate.getFullYear() - startDate.getFullYear())*12 + CurrentDate.getMonth() - startDate.getMonth()) % repeatEvery == 0;
                } else if (repeatFrequency == "YEAR"){
                  isDisplayedTodayCalculated = (startDate.getDate() == CurrentDate.getDate()) &&
                  (CurrentDate.getMonth() == startDate.getMonth()) &&
                  (CurrentDate.getFullYear() - startDate.getFullYear()) % repeatEvery == 0;
                }
              }
            }
          }
          gr["is_displayed_today"] = isDisplayedTodayCalculated
        });
        db.collection("users")
        .doc(doc.id)
        .update({ "goals&routines": arrs });
      }
    });
    res.redirect(303, 'success');
  });
});
/*
exports.NotificationScheduler = functions.https.onCall(async (data, context) => {
   
  const userId = data.userId;
 
  //var arr = [];
  //var notificationPayload = {};

  interface notificationPayload { "message" : {[index: string]: { message: string, time: string, title: string }}};  
  var notificationPayload = {} as notificationPayload; 

  /*var notificationPayload = {
    after: {message: "", time: "", title: ""},
    before: {message: "", time: string, title: string},
    during: {message: string, time: string, title: string}
  };*/

  /*
  after: {message: string, time: string, title: string},
     before: {message: string, time: string, title: string},
     during: {message: string, time: string, title: string}
  */
/*
  return db.collection('users').doc(userId).get()
      .then(doc => {
          if (doc.data()!["goals&routines"] != null) {
              let arrs = doc.data()!["goals&routines"];
              arrs.forEach((gr: {
                start_day_and_time: string,
                end_day_and_time: string,
                is_displayed_today: boolean,
                is_complete: boolean,
                title: string,
                user_notifications: {[index: string]: {is_enabled: boolean, is_set: boolean, message: string, time: string}}
                
              }) => {
                  if( gr['is_displayed_today'] && !gr['is_complete']){
                      console.log("Starting now...");

                      let currentDate = new Date(new Date().toLocaleString('en-US', {
                          timeZone: "America/Los_Angeles"
                      }));
                      let startDate = new Date(new Date(gr["start_day_and_time"]).toLocaleString('en-US', {
                          timeZone: "America/Los_Angeles"
                      }));
                      let endDate = new Date(new Date(gr["end_day_and_time"]).toLocaleString('en-US', {
                          timeZone: "America/Los_Angeles"
                      }));

                      console.log('currentdate. '+currentDate);
                      console.log('startdate. ' + startDate);

                      Object.keys(gr['user_notifications'])
                          .forEach((k) => {
                          let notifDate = new Date();
                          if (k == 'after' && gr['user_notifications'][k]['is_enabled']) {
                            
                            console.log('after');
                            let notifTime = gr['user_notifications'][k]['time'].split(":");
                            notifDate = endDate;
                            notifDate.setDate(currentDate.getDate());
                            notifDate.setHours(endDate.getHours() + Number(notifTime[0]));
                            notifDate.setMinutes(endDate.getMinutes() + Number(notifTime[1]));
                            notifDate.setSeconds(endDate.getSeconds() + Number(notifTime[2]));
                            //notificationPayload.after = {time: notifDate.toLocaleString('en-US'), message: "after", title: "titl"};
                          }
                          else if (k == 'before' && gr['user_notifications'][k]['is_enabled']) {

                            console.log("Before:");
                            let notifTime = gr['user_notifications'][k]['time'].split(":");
                            notifDate = startDate;
                            notifDate.setDate(currentDate.getDate());
                            notifDate.setHours(startDate.getHours() - Number(notifTime[0]));
                            notifDate.setMinutes(startDate.getMinutes() - Number(notifTime[1]));
                            notifDate.setSeconds(startDate.getSeconds() - Number(notifTime[2]));
                            //notificationPayload.before = {time: notifDate.toLocaleString('en-US'), message: "before", title: "titl"};
                          }
                          else if (k == 'during' && gr['user_notifications'][k]['is_enabled']) {
                            
                            console.log("During:");
                            let notifTime = gr['user_notifications'][k]['time'].split(":");
                            notifDate = startDate;
                            notifDate.setDate(currentDate.getDate());
                            notifDate.setHours(startDate.getHours() + Number(notifTime[0]));
                            notifDate.setMinutes(startDate.getMinutes() + Number(notifTime[1]));
                            notifDate.setSeconds(startDate.getSeconds() + Number(notifTime[2]));
                            //notificationPayload.during = {time: notifDate.toLocaleString('en-US'), message: "during", title: "titl"};
                          }

                          //notificationPayload.push = notifDate?.toLocaleString('en-US');
                          notificationPayload.message[k] = {time: notifDate.toLocaleString('en-US'), message: gr['user_notifications'][k]['message'], title: gr["title"]};


                          
                      });
                      console.log(notificationPayload);
                      //console.log('Start:' + gr['start_day_and_time']);
                      //console.log('End:' + gr['end_day_and_time']);
                  }
              });
              return 200;
              //db.collection("users")
              //.doc(doc.id)
              //.update({ "goals&routines": arrs });
          }
          else{
            return 404;
          }
      });
      //res.redirect(303, 'success');
});
*/

export const SaveDeviceToken = functions.https.onRequest((req, res) =>{
  const userId = req.body.userId.toString();
  const deviceToken = req.body.deviceToken.toString();

  const user = db.collection('users').doc(userId);

  user.get()
  .then( doc => {
    if (!doc.exists) {
      console.log('No such document!');
      res.status(500).send("Unable to find document")
  }
  else{
      const userInfo = doc.data()!;
      console.log(typeof userInfo);
      if(!userInfo['device_token']){
          userInfo.device_token = [];
          console.log("Creating device_token array");
      }
      console.log("Pushing into device_token array");
      //console.log(typeof userInfo['device_token']);
      userInfo['device_token'].forEach( (token: String)=>{
        if (token === deviceToken) {
          console.log("Token already exists. Exiting");
          res.status(200).send("Token already exists.");
        }
      });
      userInfo['device_token'].push(deviceToken);
      user.set(userInfo).then().catch();
      res.status(200).send("Succesfully inserted");
  }
  })
  .catch(error =>{
    console.log(error)
    res.status(500).send("Some problem occurred. Try again.")
  })
});

export const GetEventsForTheDay = functions.https.onRequest((req, res) => {

  const id = req.body.id.toString();
  let startParam = req.body.start.toString();
  let endParam = req.body.end.toString();

  console.log( 'start : ', startParam, ' end:', endParam );

  setUpAuthById( id, ( auth: any ) => {
      if(auth==500) {
          res.status(500).send('Failed to find document!');
      }
      else {
          const calendar = google.calendar( { version: 'v3', auth } );
          calendar.events.list(
              {
                  calendarId:   'primary',
                  timeMin:      startParam,
                  timeMax:      endParam,
                  maxResults:   999,
                  singleEvents: true,
                  orderBy:      'startTime'
                  //timeZone: 
              },
              (error: any, response: any) => {
                  //CallBack
                  if ( error ) {
                      res.status(500).send( 'The post request returned an error: ' + error );
                  }
                  else{
                      res.status(200).send(response.data.items);
                  }
              }
          );
      }
  });
});

function setUpAuthById( id: string, callback: any ) {
  console.log("SETUPAUTHBYID");
  fs.readFile( credentials_url, ( err: any, content: any ) => {
      if ( err ) {
          console.log( 'Error loading client secret file:', err );
          return;
      }
      // Authorize a client with credentials, then call the Google Calendar
      authorizeById( JSON.parse( content ), id, callback ); 
  });
}

function authorizeById( credentials: any, id: string, callback: any ) {
  console.log("AUTHORIZEBYID");
  const { client_secret, client_id } = credentials.web;

  const oAuth2Client = new OAuth2Client(
      client_id,
      client_secret,
      redirect_uri
  );

  // Store to firebase
if ( id ) {
      db.collection( 'users' ).doc( id ).get()
      .then((doc) => {
          if (!doc.exists) {
              console.log('No such document!');
              callback(500);
          }
          else {
              const userAuthInfo = doc.data();
              oAuth2Client.setCredentials( {
              access_token:  userAuthInfo!.google_auth_token,
              refresh_token: userAuthInfo!.google_refresh_token
          });
          callback(oAuth2Client);
          }
      })
      .catch(error=>{
          console.log("Error::: ", error);
      });
}
}

function getCurrentDateTimeUTC() {
  const today = new Date()
  return today.toUTCString()
}

function parseValue(value: string, valueType: string): any {
  switch (valueType) {
    case 'boolean':
    switch (value.toLowerCase()) {
      case 'true':
      return true
      break;
      case 'false':
      return false
      break;
      default:
      return false
      break;
    }
    break;

    case 'integer':
    return Number(value)
    break;

    default:
    return value
    break;
  }
}

function setNotificationData(notificationData:any) {
  if (notificationData != undefined) {
    for (const time of ['before', 'during', 'after']) {
      if (!(time in notificationData)) {
        notificationData[time] = {}
      }
      if (!('time' in notificationData)) {
        notificationData[time]['time'] = '00:10:00'
      } else {
        if (notificationData[time]['time'] === 0) {
          notificationData[time]['time'] = '00:10:00'
        }
      }
      if (!('message' in notificationData)) {
        notificationData[time]['message'] = ''
      }
      if (!('is_enabled' in notificationData)) {
        notificationData[time]['is_enabled'] = false
      }
      if (!('is_set' in notificationData)) {
        notificationData[time]['is_set'] = false
      }
      delete notificationData[time]['is_toggled']
    }
    delete notificationData['is_set']
    delete notificationData['message']
    delete notificationData['is_enabled']
    delete notificationData['time']
  }
}

function deleteFields(data:any) {
  delete data['user_notification_set']
  delete data['ta_notification_reasons']
  delete data['remind_types']
  delete data['reminds_user']
  delete data['notifies_ta']
}
